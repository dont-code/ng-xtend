# Describe an entity type

**Use case:** You want the framework to know the exact shape of your data — field names, types, and nesting — so it can render fields in order, use proper widgets, and support creating new objects.

**Prerequisite:** [Display any object](display-entity.html), [Edit any object](edit-entity.html)

## Steps

### 1. Add `xt-type` dependency

```json
"dependencies": {
  "xt-type": "^0.10.4"
}
```

### 2. Register types

In your `App` component, call `resolverService.registerTypes` with a type map:

```typescript
this.resolverService.registerTypes({
  buyType: {
    on: 'date',
    at: 'string',
    price: 'number'
  },
  bookType: {
    bookName: 'string',
    author: 'string',
    nationality: 'string',
    bought: 'buyType',
    read: 'boolean'
  }
});
```

Each key is a **type name** you choose. Each value maps **field names** to **type strings**:

| Type string | Widget |
|-------------|--------|
| `'string'` | Text input |
| `'number'` | Numeric input |
| `'boolean'` | Toggle / checkbox |
| `'date'` | Date picker |
| `'otherTypeName'` | Nested sub-form using that type |

### 3. Pass `valueType` to `<xt-render>`

```html
<xt-render displayMode="FULL_EDITABLE" valueType="bookType" [formGroup]="myForm"> </xt-render>
```

The resolver now reads the type descriptor to know which fields exist, their order, and which widget to use for each.

## What changes vs no type

| Without type | With type |
|-------------|-----------|
| Fields in arbitrary `Object.keys` order | Fields in declaration order |
| Guesses widget from value (e.g. `typeof`) | Uses declared type (date → date picker) |
| Cannot create empty objects | Can build forms from empty `{}` |
| Unknown field count at design time | Full type info available |

## Next steps

- [Create new entities](create-entity.html) — generate a blank form from your type
- [Add plugins for rich fields](add-plugins.html) — replace `'string'` with `'country'` for country dropdowns
- [Handle entity relations](entity-relations.html) — reference another type via MANY-TO-ONE
