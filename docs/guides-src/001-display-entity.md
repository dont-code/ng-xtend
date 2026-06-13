# Display any object

**Use case:** You have an object of unknown shape and want to render it as a readable table or card — without writing field-by-field templates.

## Steps

### 1. Add dependencies

```json
"dependencies": {
  "xt-components": "^0.6.4",
  "xt-plugin-default": "^0.6.4"
}
```

### 2. Register the default plugin

In your `App` component, inject `XtResolverService` and register the default plugin so the resolver knows how to render primitive types (`string`, `number`, `boolean`, `Date`, `object`, arrays).

```typescript
import {registerDefaultPlugin} from 'xt-plugin-default';
import {XtResolverService} from 'xt-components';

export class App {
  resolverService = inject(XtResolverService);
  constructor() {
    registerDefaultPlugin(this.resolverService);
  }
}
```

[See full example](https://github.com/dont-code/ng-xtend-examples/blob/main/basic/src/app/app.ts)

### 3. Add `<xt-render>` to your template

```html
<xt-render displayMode="LIST_VIEW" [value]="myObject"> </xt-render>
<xt-render displayMode="FULL_VIEW" [value]="myObject"> </xt-render>
```

| Mode | Renders as | Use when |
|------|-----------|----------|
| `LIST_VIEW` | Table with key/value rows | Compact summary |
| `FULL_VIEW` | Spacious field-per-line layout | Detail / read-only view |

## How it works

The default plugin's object handler introspects the value at runtime (`typeof`, `instanceof`, `Object.keys`) and renders each field with the appropriate widget. Nested objects are recursed automatically.

[Full code example](https://github.com/dont-code/ng-xtend-examples/blob/main/basic/)

## Next steps

- [Edit an object](edit-entity.html) — turn the display into an editable form
- [Describe an entity type](describe-type.html) — declare the shape explicitly for better control
