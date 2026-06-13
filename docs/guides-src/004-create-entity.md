# Create new entities

**Use case:** You want to provide a "Create" button that shows an empty form for a new entity, pre-configured with the right fields, types, and default values.

**Prerequisite:** [Describe an entity type](describe-type.html)

## Steps

### 1. Build a form from an empty object

```typescript
import {updateFormGroupWithValue} from 'xt-components';

updateFormGroupWithValue(this.myForm, {}, 'bookType', this.resolver.typeResolver);
```

Passing `{}` as the value together with the type name tells `updateFormGroupWithValue` to create form controls for every field declared in the type, all initially empty.

### 2. Wire the create form in the template

```html
<form [formGroup]="myForm" (ngSubmit)="createEntity()">
  <xt-render displayMode="FULL_EDITABLE" valueType="bookType"
             [formGroup]="myForm"> </xt-render>
  <p-button label="Create" type="submit"
            [disabled]="!myForm.valid || myForm.pristine" />
  <p-button label="Reset" (onClick)="myForm.reset()" />
</form>
```

### 3. Handle submission

```typescript
protected createEntity() {
  const newEntity = this.myForm.value;
  // Append to local list or persist via API
  this.entities.update(list => [...list, newEntity]);
  this.myForm.reset();
}
```

## How it works

The type descriptor provides the field schema. `updateFormGroupWithValue` uses that schema to build a `FormGroup` with the correct structure — including nested types — even though the source object is empty. The form controls are fully reactive and support validation.

## Next steps

- [Connect list selection to editor](connect-list-editor.html) — add create/update to a list view
- [Persist data via REST API](persist-data.html) — save created entities to a backend
