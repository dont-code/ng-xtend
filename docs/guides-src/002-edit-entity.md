# Edit any object

**Use case:** You want to let users edit an object through an auto-generated form, without manually creating form controls.

**Prerequisite:** [Display any object](display-entity.html)

## Steps

### 1. Create a reactive form group

```typescript
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {updateFormGroupWithValue} from 'xt-components';

export class MyComponent implements OnInit {
  formBuilder = inject(FormBuilder);
  myForm = this.formBuilder.group({});

  ngOnInit(): void {
    updateFormGroupWithValue(this.myForm, myEntity);
  }
}
```

`updateFormGroupWithValue` walks the object recursively, creates a `FormControl` for every leaf value, and populates controls with current data.

### 2. Bind the form to `<xt-render>`

```html
<form [formGroup]="myForm">
  <xt-render displayMode="FULL_EDITABLE" [formGroup]="myForm"> </xt-render>
</form>
```

Do **not** pass `[value]` when using `[formGroup]` — the form group *is* the value source.

### 3. Same data, three display modes

Swap `displayMode` to switch between views without changing any other code:

```html
<xt-render displayMode="LIST_VIEW" [value]="data">       <!-- table -->
<xt-render displayMode="FULL_VIEW" [value]="data">        <!-- detail card -->
<xt-render displayMode="FULL_EDITABLE" [formGroup]="f">   <!-- form -->
```

## Next steps

- [Describe an entity type](describe-type.html) — registering a type gives you field ordering, validation, and creation support
- [Connect list selection to editor](connect-list-editor.html) — let users click an item in a list to populate the edit form
