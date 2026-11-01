import { computed, inject, Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { XtResolverService } from 'xt-components';
import { XtApiStoreProvider, XtMemoryStoreProvider, XtStoreManagerService } from 'xt-store';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

/**
 * A single plugin as seen by the tester: the remote url it was loaded from
 * plus a bit of bookkeeping for the UI.
 */
export type LoadedPlugin = {
  /** The remoteEntry.json url, or a synthetic `builtin://` url for built-in plugins. */
  url: string;
  /** The plugin name as registered in the resolver. */
  name: string;
  /** Epoch ms of when the plugin was loaded. */
  loadedAt: number;
  /** True for plugins registered at bootstrap (not loaded from a remote url). */
  builtin?: boolean;
  /** Optional logo url exposed by the plugin. */
  logoUrl?: string;
  /** Set when the last load attempt failed. */
  error?: string;
};

/** Persisted document storage configuration. */
export type StorageConfig = {
  inMemory: boolean;
  docUrl: string | null;
};

const PLUGINS_KEY = 'xt-tester.plugins';
const CONFIG_KEY = 'xt-tester.config';
const BUILTIN_PREFIX = 'builtin://';

type LoadOptions = {
  /** When true, no success toast is shown (used when restoring a previous session). */
  silent?: boolean;
};

/**
 * Central place holding the tester session state:
 *
 * - the list of loaded plugins (and the ability to load / reload / remove them),
 * - the document storage configuration,
 * - persistence of both across reloads.
 *
 * Keeping this in a service (rather than in the components) lets the shell show
 * a live "plugins loaded" badge and lets the different pages share state.
 */
@Injectable({ providedIn: 'root' })
export class TesterSessionService {
  private readonly resolver = inject(XtResolverService);
  private readonly storeMgr = inject(XtStoreManagerService);
  private readonly apiProvider = inject(XtApiStoreProvider);
  private readonly messages = inject(MessageService);
  private readonly errorHandler = inject(ErrorHandlerService);

  /** All plugins currently known to the tester (builtins included). */
  readonly loadedPlugins = signal<LoadedPlugin[]>([]);
  /** True while a remote plugin is being fetched. */
  readonly loading = signal(false);
  /** The url currently being fetched, if any. */
  readonly loadingUrl = signal<string | null>(null);

  /** Storage config signals - bound directly by the configure page. */
  readonly inMemory = signal(true);
  readonly docUrl = signal<string | null>(null);
  /** Becomes true once the user has applied a configuration. */
  readonly configApplied = signal(false);

  /** Name of the last component picked on the test page (shared so it survives navigation). */
  readonly testedComponent = signal<string | null>(null);

  /** Number of successfully loaded plugins. */
  readonly pluginCount = computed(() => this.loadedPlugins().filter((p) => !p.error).length);
  /** Number of registered components across all plugins. */
  readonly componentCount = computed(() => this.resolver.listComponents().length);
  readonly hasPlugins = computed(() => this.pluginCount() > 0);
  /** True when at least one plugin was loaded from a remote url (builtins excluded). */
  readonly hasRemotePlugins = computed(() =>
    this.loadedPlugins().some((p) => !p.builtin && p.error == null)
  );

  /** A few well known document endpoints offered as suggestions. */
  readonly knownDocUrls = [
    'https://test.dont-code.net/demo/documents',
    'https://collinfr.net/dont-code/documents',
    'http://localhost:8084/documents',
  ];

  constructor() {
    this.restoreConfig();
  }

  // ---------------------------------------------------------------------------
  // Plugins
  // ---------------------------------------------------------------------------

  /**
   * Registers the plugins that are already loaded at bootstrap (the default
   * plugin) as builtin entries, so they show up in the plugins list.
   */
  captureBuiltins(): void {
    const builtins = this.resolver.listPlugins().map<LoadedPlugin>((plugin) => ({
      url: BUILTIN_PREFIX + plugin.name,
      name: plugin.name,
      loadedAt: Date.now(),
      builtin: true,
      logoUrl: plugin.uriLogo,
    }));
    this.loadedPlugins.set(builtins);
  }

  /**
   * Loads a plugin from a url (a folder url or a remoteEntry.json url) and
   * registers it. Returns the resulting record, or null when loading failed.
   */
  async loadPlugin(rawUrl: string, options: LoadOptions = {}): Promise<LoadedPlugin | null> {
    const url = this.normalizeUrl(rawUrl);
    if (url == null) return null;

    const existing = this.loadedPlugins().find((p) => p.url === url);
    if (existing != null && existing.error == null) {
      if (!options.silent) {
        this.messages.add({ severity: 'info', summary: 'Already loaded', detail: existing.name });
      }
      return existing;
    }

    this.loading.set(true);
    this.loadingUrl.set(url);
    try {
      const module = await loadRemoteModule({ remoteEntry: url, exposedModule: './Register' });
      const name = this.resolver.registerPluginModule(module, url);
      this.resolver.resolvePendingReferences();
      if (!name) throw new Error('The plugin did not return a name during registration.');

      const info = this.resolver.listPlugins().find((p) => p.name === name);
      const record: LoadedPlugin = {
        url,
        name,
        loadedAt: Date.now(),
        builtin: false,
        logoUrl: info?.uriLogo,
      };
      this.upsert(record);
      this.persistPlugins();
      if (!options.silent) {
        this.messages.add({ severity: 'success', summary: 'Plugin loaded', detail: name });
      }
      return record;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Keep a failed entry so the user sees what went wrong, but don't persist it.
      this.upsert({ url, name: url, loadedAt: Date.now(), error: message });
      if (!options.silent) {
        this.errorHandler.errorOccurred(error, `Failed to load plugin from ${url}`);
      }
      return null;
    } finally {
      this.loading.set(false);
      this.loadingUrl.set(null);
    }
  }

  /** Re-fetches a plugin from its url (useful after rebuilding a remote). */
  async reloadPlugin(record: LoadedPlugin): Promise<void> {
    this.loadedPlugins.update((list) => list.filter((p) => p.url !== record.url));
    await this.loadPlugin(record.url);
  }

  /** Removes a plugin (builtins cannot be removed). */
  removePlugin(record: LoadedPlugin): void {
    if (record.builtin) return;
    this.resolver.unregisterPlugin(record.name);
    this.loadedPlugins.update((list) => list.filter((p) => p.url !== record.url));
    this.persistPlugins();
    this.messages.add({ severity: 'success', summary: 'Plugin removed', detail: record.name });
  }

  /** Removes all remotely loaded plugins. */
  clearPlugins(): void {
    const removable = this.loadedPlugins().filter((p) => !p.builtin);
    for (const plugin of removable) {
      this.resolver.unregisterPlugin(plugin.name);
    }
    this.loadedPlugins.update((list) => list.filter((p) => p.builtin));
    this.persistPlugins();
    if (removable.length > 0) {
      this.messages.add({
        severity: 'success',
        summary: 'Plugins cleared',
        detail: `${removable.length} plugin(s) removed`,
      });
    }
  }

  /** Reloads the plugins remembered from the previous session. */
  async restorePlugins(): Promise<void> {
    const urls = this.readStoredPlugins();
    if (urls.length === 0) return;

    const failures: string[] = [];
    for (const url of urls) {
      const result = await this.loadPlugin(url, { silent: true });
      if (result == null) failures.push(url);
    }

    if (failures.length > 0) {
      this.messages.add({
        severity: 'warn',
        summary: 'Some plugins could not be restored',
        detail: failures.join(', '),
        life: 6000,
      });
    } else {
      this.messages.add({
        severity: 'success',
        summary: 'Session restored',
        detail: `${urls.length} plugin(s) reloaded`,
        life: 3000,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Storage configuration
  // ---------------------------------------------------------------------------

  /** Applies (and persists) the current storage configuration. */
  applyConfig(inMemory: boolean, docUrl: string | null): void {
    this.inMemory.set(inMemory);
    this.docUrl.set(docUrl);

    if (inMemory) {
      this.storeMgr.setDefaultStoreProvider(new XtMemoryStoreProvider());
    } else {
      this.apiProvider.docUrl = docUrl ?? '';
      this.storeMgr.setDefaultStoreProvider(this.apiProvider);
    }

    this.configApplied.set(true);
    this.persistConfig();
    this.messages.add({
      severity: 'success',
      summary: 'Configuration applied',
      detail: inMemory ? 'Documents stored in memory' : `Documents stored at ${docUrl}`,
      life: 3000,
    });
  }

  /** A short human readable description of the active storage configuration. */
  readonly storageSummary = computed(() =>
    this.inMemory() ? 'In memory (temporary)' : (this.docUrl() ?? 'Not configured')
  );

  // ---------------------------------------------------------------------------
  // Persistence helpers
  // ---------------------------------------------------------------------------

  private upsert(record: LoadedPlugin): void {
    this.loadedPlugins.update((list) => [...list.filter((p) => p.url !== record.url), record]);
  }

  private normalizeUrl(rawUrl: string): string | null {
    let url = (rawUrl ?? '').trim();
    if (url.length === 0) return null;
    if (url.startsWith(BUILTIN_PREFIX)) return url;
    if (!url.endsWith('remoteEntry.json')) {
      url = url + (url.endsWith('/') ? '' : '/') + 'remoteEntry.json';
    }
    return url;
  }

  private persistPlugins(): void {
    const urls = this.loadedPlugins()
      .filter((p) => !p.builtin && p.error == null)
      .map((p) => p.url);
    this.write(PLUGINS_KEY, JSON.stringify(urls));
  }

  private readStoredPlugins(): string[] {
    const raw = this.read(PLUGINS_KEY);
    if (raw == null) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((u): u is string => typeof u === 'string') : [];
    } catch {
      return [];
    }
  }

  private persistConfig(): void {
    const config: StorageConfig = { inMemory: this.inMemory(), docUrl: this.docUrl() };
    this.write(CONFIG_KEY, JSON.stringify(config));
  }

  private restoreConfig(): void {
    const raw = this.read(CONFIG_KEY);
    if (raw == null) return;
    try {
      const config = JSON.parse(raw) as StorageConfig;
      if (typeof config.inMemory === 'boolean') {
        this.applyConfigSilently(config.inMemory, config.docUrl ?? null);
      }
    } catch {
      /* ignore malformed config */
    }
  }

  /** Applies a config without showing a toast (used on startup). */
  private applyConfigSilently(inMemory: boolean, docUrl: string | null): void {
    this.inMemory.set(inMemory);
    this.docUrl.set(docUrl);
    if (inMemory) {
      this.storeMgr.setDefaultStoreProvider(new XtMemoryStoreProvider());
    } else {
      this.apiProvider.docUrl = docUrl ?? '';
      this.storeMgr.setDefaultStoreProvider(this.apiProvider);
    }
    this.configApplied.set(false);
  }

  private read(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* storage unavailable - ignore */
    }
  }
}
