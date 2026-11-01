import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
  Type,
} from '@angular/core';
import {
  attachToFormGroup,
  XtComponent,
  XtComponentInfo,
  XtRenderComponent,
  XtResolverService,
} from 'xt-components';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Subscription } from 'rxjs';
import { Panel } from 'primeng/panel';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TesterSessionService } from '../core/tester-session.service';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

type ComponentByPlugin = {
  pluginName: string;
  items: XtComponentInfo<any>[];
};

@Component({
  selector: 'app-plugin-tester-component',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    XtRenderComponent,
    AutoComplete,
    Panel,
    Button,
    Tag,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tooltip,
    PageHeaderComponent,
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestComponent implements OnDestroy {
  protected readonly xtResolver = inject(XtResolverService);
  protected readonly builder = inject(FormBuilder);
  protected readonly session = inject(TesterSessionService);
  private readonly messages = inject(MessageService);

  readonly value = signal<any>({ TestComponent: null });
  readonly mainForm: FormGroup = this.builder.group({});

  readonly component = signal<XtComponentInfo<any> | null>(null);
  readonly query = signal('');

  /**
   * Suggestions for the search autocomplete.
   *
   * NOTE: PrimeNG's AutoComplete only clears its internal "loading" flag when
   * the `suggestions` input reference changes (see `handleSuggestionsChange`).
   * We therefore store a fresh array on every search instead of binding a
   * `computed` (which returns a cached reference and would leave the spinner
   * spinning forever when the query does not change, e.g. focusing an empty box).
   */
  readonly suggestions = signal<ComponentByPlugin[]>([]);

  readonly dirty = signal(false);
  readonly activeTab = signal<string | number | undefined>(0);

  protected readonly subscriptions = new Subscription();

  /** Components available for testing, grouped by plugin and filtered by the search query. */
  readonly componentsByPlugin = computed<ComponentByPlugin[]>(() =>
    this.groupComponents(this.query())
  );

  /** Flattened component list (used to know if anything is testable at all). */
  readonly totalComponents = computed(() =>
    this.componentsByPlugin().reduce((sum, group) => sum + group.items.length, 0)
  );

  readonly componentClass = computed<Type<XtComponent<any>> | undefined>(() => {
    return this.component()?.componentClass;
  });

  readonly valueType = computed<string | undefined>(() => this.findTypeFor(this.component()));

  /** The current value under test, kept in sync with the edit form. */
  readonly currentValue = computed<any>(() => this.value()?.['TestComponent'] ?? null);

  readonly valueJson = computed(() => {
    try {
      return JSON.stringify(this.currentValue(), null, 2);
    } catch {
      return String(this.currentValue());
    }
  });

  constructor() {
    this.listenToValueChanges();

    // Restore the component picked during a previous visit to this page.
    const last = this.session.testedComponent();
    if (last != null) {
      const info = this.xtResolver
        .listComponents()
        .find((comp) => comp.componentName === last);
      if (info) this.selectComponent(info);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  completeName(event: { query: string }): void {
    const query = event.query ?? '';
    this.query.set(query);
    // Always assign a *new* array so PrimeNG clears its loading state.
    this.suggestions.set(this.groupComponents(query));
  }

  /** Groups the registered components by plugin, filtered by (optional) query. */
  private groupComponents(query: string): ComponentByPlugin[] {
    const needle = query.trim().toLowerCase();
    const ret: ComponentByPlugin[] = [];
    for (const plugin of this.xtResolver.listPlugins()) {
      const items = (plugin.components ?? []).filter(
        (comp) => needle.length === 0 || comp.componentName.toLowerCase().includes(needle)
      );
      if (items.length > 0) {
        ret.push({ pluginName: plugin.name, items });
      }
    }
    return ret;
  }

  componentValid(): boolean {
    const comp = this.component();
    return comp != null && comp.componentClass != null;
  }

  componentSwitch(event: AutoCompleteSelectEvent): void {
    this.selectComponent(event.value);
  }

  selectComponent(comp: XtComponentInfo<any> | null | undefined): void {
    if (comp == null) return;
    if (this.mainForm.contains('TestComponent')) {
      this.mainForm.removeControl('TestComponent');
    }
    attachToFormGroup(
      this.mainForm,
      'TestComponent',
      null,
      this.findTypeFor(comp),
      this.xtResolver.typeResolver
    );
    this.component.set(comp);
    this.value.set({ TestComponent: this.mainForm.get('TestComponent')?.value ?? null });
    this.dirty.set(false);
    this.activeTab.set(0);
    this.session.testedComponent.set(comp.componentName);
  }

  isSelected(comp: XtComponentInfo<any>): boolean {
    return this.component()?.componentName === comp.componentName;
  }

  resetForm(): void {
    this.mainForm.reset({ TestComponent: null });
    this.mainForm.markAsPristine();
    this.value.set({ TestComponent: null });
    this.dirty.set(false);
  }

  clearValue(): void {
    this.mainForm.get('TestComponent')?.setValue(null);
    this.value.set({ TestComponent: null });
    this.dirty.set(false);
  }

  async copyValue(): Promise<void> {
    const text = this.valueJson();
    try {
      await navigator.clipboard?.writeText(text);
      this.messages.add({ severity: 'success', summary: 'Copied', detail: 'Value copied to clipboard', life: 2000 });
    } catch {
      this.messages.add({ severity: 'warn', summary: 'Copy failed', detail: 'Clipboard is not available', life: 3000 });
    }
  }

  findTypeFor(comp: XtComponentInfo<any> | null): string | undefined {
    if (comp?.typesHandled != null && comp.typesHandled.length > 0) {
      return comp.typesHandled[0];
    }
    return undefined;
  }

  private listenToValueChanges(): void {
    this.subscriptions.add(
      this.mainForm.valueChanges.subscribe({
        next: (newValue) => {
          if (newValue.TestComponent !== undefined) {
            this.value.set(newValue);
            this.dirty.set(!this.mainForm.pristine);
          }
        },
      })
    );
  }
}
