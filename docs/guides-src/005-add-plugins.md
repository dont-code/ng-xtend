# Add plugins for rich fields

**Use case:** You want fields like `country` or `money-amount` to render with rich UX (flag + country name dropdown, currency formatting) instead of plain text inputs — without changing your templates.

**Prerequisite:** [Describe an entity type](describe-type.html)

## Steps

### 1. Add plugin dependencies

```json
"dependencies": {
  "xt-plugin-intl": "~0.6.4",
  "countries-ts": "~2.1.0",
  "xt-plugin-finance": "~0.6.4"
}
```

### 2. Register the plugins

```typescript
import {registerInternationalPlugin} from 'xt-plugin-intl';
import {registerFinancePlugin} from 'xt-plugin-finance';

registerDefaultPlugin(this.resolverService);
registerInternationalPlugin(this.resolverService);
registerFinancePlugin(this.resolverService);
```

### 3. Refine your type descriptor

Swap the generic type strings for the domain-specific ones the plugins provide:

```typescript
this.resolverService.registerTypes({
  buyType: {
    on: 'date',
    at: 'string',
    price: 'money-amount'   // Was 'number'
  },
  bookType: {
    bookName: 'string',
    author: 'string',
    nationality: 'country',  // Was 'string'
    bought: 'buyType',
    read: 'boolean'
  }
});
```

## What each plugin provides

| Plugin | Type names | Renders as |
|--------|-----------|------------|
| `xt-plugin-intl` | `'country'` | Searchable dropdown with flag icons and country names |
| `xt-plugin-finance` | `'money-amount'` | Formatted number with currency symbol, currency selector |

## How it works

When the resolver encounters a field typed as `'country'`, it searches its registry for a component registered for that type by the international plugin. The same `<xt-render>` tag resolves to a completely different widget — no template changes needed.

## Next steps

- [Connect list selection to editor](connect-list-editor.html)
- [Persist data via REST API](persist-data.html)
- [Load plugins at runtime](load-plugins-runtime.html) — fetch plugins from a remote server instead of bundling
