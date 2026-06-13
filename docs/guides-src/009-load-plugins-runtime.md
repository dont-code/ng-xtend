# Load plugins at runtime

**Use case:** You want to load plugins from a remote server at startup instead of bundling them, so you can update or add plugins without rebuilding the host application.

**Prerequisite:** [Add plugins for rich fields](add-plugins.html), [Persist data via REST API](persist-data.html)

## Steps

### 1. Add Native Federation dependencies

```json
"dependencies": {
  "@softarc/native-federation-runtime": "3.3.6",
  "@angular-architects/native-federation": "20.1.7",
  "es-module-shims": "2.6.2"
}
```

### 2. Configure federation

```javascript
// federation.config.js
const { withNativeFederation, shareAll } =
  require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
  skip: ['chart.js/auto', 'primeng/chart', 'primeicons']
});
```

`shareAll` ensures Angular and ng-xtend libraries are shared as singletons between the host and remote plugins.

### 3. Restructure bootstrapping

`main.ts` must call `initFederation()` before Angular can start:

```typescript
import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch(err => console.error(err))
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
```

`bootstrap.ts` contains the normal Angular bootstrap:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig);
```

### 4. Create a config service for loading order

```typescript
@Injectable({ providedIn: 'root' })
export class ConfigManagerService {
  configLoaded = signal(false);
  errorMsg = signal<string | null>(null);
  protected resolverService = inject(XtResolverService);

  loadConfig(pluginConfig, types) {
    this.loadPlugins(pluginConfig).then(() => {
      this.resolverService.registerTypes(types);
      this.configLoaded.set(true);
    }).catch(err => this.errorMsg.set(err.toString()));
  }

  async loadPlugins(pluginInfos) {
    for (const { url } of pluginInfos) {
      await this.resolverService.loadPlugin(url);
    }
  }
}
```

Plugins must be loaded **before** types are registered, because type declarations reference plugin-provided names like `'country'`.

### 5. Wire it up in `App`

```typescript
export class App {
  protected configService = inject(ConfigManagerService);

  constructor() {
    registerDefaultPlugin(this.resolverService);

    this.configService.loadConfig(
      [{ plugin: 'International Plugin',
         url: 'https://cdn.example.com/intl-plugin/remoteEntry.json' },
       { plugin: 'Finance Plugin',
         url: 'https://cdn.example.com/finance-plugin/remoteEntry.json' }],
      { 'Example Book': { bookName: 'string', nationality: 'country',
                          bought: { price: 'money-amount' }, read: 'boolean' } }
    );
  }
}
```

### 6. Handle loading states in the template

```html
@if (config.configLoaded()) {
  <xt-render displayMode="LIST_VIEW" valueType="Example Book" ...>
} @else if (config.errorMsg()) {
  <h2>Error loading plugins</h2>
  <span>{{config.errorMsg()}}</span>
} @else {
  <h2>Loading plugins...</h2>
}
```

The component can use `linkedSignal` for the form so it only builds after config is loaded:

```typescript
bookForm = linkedSignal(() =>
  this.config.configLoaded()
    ? this.calculateBookForm()
    : this.formBuilder.group({})
);
```

## How it works

Native Federation loads the remote plugin's Webpack Module Federation manifest at runtime, fetches the plugin chunks on demand, and integrates them into the Angular module graph. The plugin's registration function runs automatically when loaded, calling `resolverService.loadPlugin()` which wraps the remote module's entry point.
