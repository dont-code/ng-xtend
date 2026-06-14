# Connect list selection to editor

**Use case:** You have a list of entities rendered by `<xt-render>` and want clicking an item to populate an edit form — without the list and editor knowing about each other.

**Prerequisite:** [Describe an entity type](describe-type.html), [Edit any object](edit-entity.html)

## Steps

### 1. Bind to `(outputs)` on the list

```html
<xt-render displayMode="LIST_VIEW" valueType="bookType"
           [value]="entities()"
           (outputs)="onOutput($event)">
</xt-render>
```

### 2. Subscribe to `valueSelected`

```typescript
import {XtComponentOutput} from 'xt-components';

onOutput(output: XtComponentOutput | null) {
  if (output?.valueSelected != null) {
    output.valueSelected.subscribe(selected => {
      this.selectedEntity.set(selected);
      this.rebuildForm();       // Populate the edit form
      this.selectedIndex = this.entities().indexOf(selected);
    });
  }
}
```

The `valueSelected` observable emits every time the user clicks a row in the list.

### 3. Rebuild the edit form on selection

```typescript
protected rebuildForm() {
  const form = this.formBuilder.group({});
  updateFormGroupWithValue(form, this.selectedEntity() ?? {},
    'bookType', this.resolver.typeResolver);
  this.bookForm.set(form);   // bookForm is a signal<FormGroup>
}
```

The form must be a `signal<FormGroup>` because it gets rebuilt each time the selection changes.

### 4. Handle create and update

```html
<form [formGroup]="bookForm()" (ngSubmit)="save()">
  <xt-render displayMode="FULL_EDITABLE" valueType="bookType"
             [formGroup]="bookForm()"> </xt-render>
  <p-button label="Save" type="submit" />
</form>
<p-button label="Create" (onClick)="create()" />
```

```typescript
protected create() {
  this.selectedEntity.set({});
  this.selectedIndex = -1;
  this.rebuildForm();
}

protected save() {
  if (this.selectedIndex === -1) {
    // Create new
    this.entities.update(list => [...list, this.bookForm().value]);
  } else {
    // Update existing
    this.entities.update(list => {
      list[this.selectedIndex] = this.bookForm().value;
      return [...list];
    });
  }
}
```

## How it works

`XtRenderComponent` instantiates a child component internally and proxies its outputs. When the child emits `valueSelected` (e.g. the list component signals a row click), the `(outputs)` emitter on `<xt-render>` fires. Your handler receives the full output object and can subscribe to individual events.

## Next steps

- [Persist data via REST API](persist-data.html) — save to a backend instead of an in-memory array
