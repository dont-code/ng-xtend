# Persist data via REST API

**Use case:** You want entities to survive page reloads by loading from and saving to a REST API, with reactive signals that keep the UI in sync.

**Prerequisite:** [Connect list selection to editor](connect-list-editor.html)

## Steps

### 1. Add dependencies

```json
"dependencies": {
  "xt-store": "~0.6.4",
  "@ngrx/signals": "^20.1.0"
}
```

Add `provideHttpClient()` to your app config:

```typescript
import {provideHttpClient} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()]
};
```

### 2. Configure the API provider

```typescript
import {XtApiStoreProvider, XtStoreManagerService} from 'xt-store';

export class App {
  protected readonly storeMgr = inject(XtStoreManagerService);
  protected readonly apiProvider = inject(XtApiStoreProvider);

  constructor() {
    this.apiProvider.apiUrl = 'https://your-api/demo/data';
    this.storeMgr.setDefaultStoreProvider(this.apiProvider);
  }
}
```

### 3. Use `XtSignalStore` in your component

```typescript
import {XtSignalStore, XtStoreManagerService} from 'xt-store';

export class MyComponent implements OnInit, AfterViewInit {
  storeMgr = inject(XtStoreManagerService);
  store: XtSignalStore<ManagedData> | null = null;

  entities = computed(() => this.store?.entities() ?? []);

  ngOnInit(): void {
    this.store = this.storeMgr.getStoreFor("Example Book");
  }

  ngAfterViewInit(): void {
    this.store!.fetchEntities();
  }
}
```

The store's `.entities()` signal automatically reflects any create/update/delete operation.

### 4. Save via the store

```typescript
protected save() {
  this.store?.storeEntity(this.form.value).then(saved => {
    // saved._id contains the server-assigned ID
  });
}
```

`storeEntity` performs a POST for new entities (no `_id`) or a PUT for existing ones (has `_id`). The store refreshes the entities list automatically.

### 5. Reload on demand

```html
<p-button label="Reload" (onClick)="reload()" />
```

```typescript
protected reload() {
  this.store?.fetchEntities();
}
```

## API contract expected by `XtApiStoreProvider`

| Action | Method | Endpoint |
|--------|--------|----------|
| List all | `GET` | `{apiUrl}/{typeName}` |
| Create | `POST` | `{apiUrl}/{typeName}` |
| Update | `PUT` | `{apiUrl}/{typeName}/{id}` |
| Delete | `DELETE` | `{apiUrl}/{typeName}/{id}` |

Entities must include an `_id` field for update/delete operations.

## Next steps

- [Handle entity relations](entity-relations.html) — manage related types like authors and books
