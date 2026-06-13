# Handle entity relations

**Use case:** You have related entity types — such as books referencing authors — and want the editor for a book to show a dropdown of all available authors (MANY-TO-ONE).

**Prerequisite:** [Describe an entity type](describe-type.html), [Persist data via REST API](persist-data.html)

## Steps

### 1. Declare the related type

```typescript
this.resolverService.registerTypes({
  'Example Author': {
    displayTemplate: '<%=it.name%> (<%=it.born.getFullYear()%>)',
    children: {
      name: 'string',
      born: 'date',
      nationality: 'country',
    }
  }
});
```

`displayTemplate` controls how each author appears in the dropdown. `it` is the entity; properties are accessed with `<%=it.property%>`.

### 2. Declare the reference field

```typescript
this.resolverService.registerTypes({
  'Example Book': {
    children: {
      bookName: 'string',
      author: {
        toType: 'Example Author',
        field: 'name',
        referenceType: 'MANY-TO-ONE'
      },
      nationality: 'country',
      read: 'boolean'
    }
  }
});

this.resolverService.resolvePendingReferences();
```

| Property | Purpose |
|----------|---------|
| `toType` | The target type this field references |
| `field` | The display field on the target type shown in the dropdown |
| `referenceType` | `'MANY-TO-ONE'` (other values: `'ONE-TO-MANY'`, `'MANY-TO-MANY'`) |
| `resolvePendingReferences()` | Must be called after all types are registered |

### 3. Create separate stores for each type

```typescript
this.authorStore = this.storeMgr.getStoreFor("Example Author", this.resolver.typeResolver);
this.bookStore = this.storeMgr.getStoreFor("Example Book", this.resolver.typeResolver);

await this.authorStore?.fetchEntities();
await this.bookStore?.fetchEntities();
```

### 4. Render both sections

```html
<h2>Authors</h2>
<xt-render displayMode="LIST_VIEW" valueType="Example Author"
           [value]="authorStore?.entities()"
           (outputs)="onAuthorOutput($event)"> </xt-render>
<xt-render displayMode="FULL_EDITABLE" valueType="Example Author"
           [formGroup]="authorForm()"> </xt-render>

<h2>Books</h2>
<xt-render displayMode="LIST_VIEW" valueType="Example Book"
           [value]="bookStore?.entities()"
           (outputs)="onBookOutput($event)"> </xt-render>
<xt-render displayMode="FULL_EDITABLE" valueType="Example Book"
           [formGroup]="bookForm()"> </xt-render>
```

When editing a book's `author` field, the framework fetches all authors from the author store and renders a dropdown. Selecting one assigns the full author entity to the book's `author` field.

## How it works

The `referenceType: 'MANY-TO-ONE'` tells the resolver to render this field as a picker referencing another entity collection. The resolver uses the type info to find the target store, query its entities, and render a selection widget using `displayTemplate` for labels. When saved, the reference is stored as a nested object with the target's `_id`.

## TypeScript model types (optional but recommended)

```typescript
import {ManagedData} from 'xt-type';

export type Author = ManagedData & {
  name: string;
  born?: Date;
  nationality?: string;
};

export type Book = ManagedData & {
  bookName: string;
  author?: Author;
  nationality?: string;
  read?: boolean;
};
```
