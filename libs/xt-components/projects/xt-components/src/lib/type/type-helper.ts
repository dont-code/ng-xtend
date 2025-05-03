import { FormControl, FormGroup } from '@angular/forms';
import { isPrimitive } from 'xt-type';

export function   updateFormGroupWithValue(formGroup: FormGroup, value:{[key:string]:any}) {

  const toDelete = new Set<string>(Object.keys(formGroup.controls));

  for (const valueKey in value) {
    const primitive = isPrimitive(value[valueKey]);
    if (toDelete.delete(valueKey)) {
      // Already a control
      const oldControl = formGroup.get(valueKey)!;
      // Is it the right type ?
      if (primitive) {
        // Must be an FormControl2
        if ((oldControl as any).controls === undefined) {
          // It's ok, just set the value
          oldControl.setValue(value[valueKey]);
        } else {
          formGroup.setControl(valueKey, new FormControl(value[valueKey]));
        }
      } else {
        // Must be a FormGroup
        if ((oldControl as any).controls === undefined) {
          const newFormGroup = new FormGroup({});
          formGroup.setControl(valueKey, newFormGroup);
          updateFormGroupWithValue(newFormGroup, value[valueKey]);
        } else {
          // It was already a formgroup, so just update it
          updateFormGroupWithValue(oldControl as FormGroup, value[valueKey]);
        }
      }
    } else {
      if (primitive) {
        formGroup.addControl(valueKey, new FormControl(value[valueKey]));
      } else {
        const newFormGroup = new FormGroup({});
        formGroup.addControl(valueKey, newFormGroup);
        updateFormGroupWithValue(newFormGroup, value[valueKey]);
      }
    }
  }

  // Delete controls that are no more used
  for (const delName of toDelete) {
    formGroup.removeControl(delName);
  }
}
