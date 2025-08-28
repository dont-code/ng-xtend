import { FormControl, FormGroup } from '@angular/forms';
import { isPrimitive, XtTypeResolver } from 'xt-type';

export function   attachToFormGroup(formGroup: FormGroup, controlName:string, value:any, valueType?:string, resolver?:XtTypeResolver) {
  // If it's a single value, just create the control
  if (((value!=null) && (isPrimitive(value))
  || (resolver?.isPrimitiveType(valueType)))) {
    const simpleControl = new FormControl(value);
    formGroup.addControl(controlName, simpleControl);
  } else {
    const complexGroup = new FormGroup({});
    updateFormGroupWithValue(complexGroup, value, valueType, resolver);
    formGroup.addControl(controlName, complexGroup);
  }
}

export function   updateFormGroupWithValue(formGroup: FormGroup, value:{[key:string]:any}, valueType?:string, resolver?:XtTypeResolver) {

  const toDelete = new Set<string>(Object.keys(formGroup.controls));
    // We merge the properties of the value if any, with the properties of the model
  const keySet  = new Set<string>((value!=null)?Object.keys(value):null);
  if( ((valueType!=null) && (resolver!=null))) {
    const modelSubName = resolver.listSubNames(valueType, value);
    for (const sub of modelSubName) {
      keySet.add(sub);
    }
  }

  for (const valueKey of keySet) {
    const subValue=(value!=null)?value[valueKey]:null;
    const subType=resolver?.findTypeName(valueType, valueKey, subValue)??undefined;
    const primitive = (subType!=null)?resolver?.isPrimitiveType(subType):isPrimitive(subValue);
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
          formGroup.setControl(valueKey, new FormControl(subValue));
        }
      } else {
        // Must be a FormGroup
        if ((oldControl as any).controls === undefined) {
          const newFormGroup = new FormGroup({});
          formGroup.setControl(valueKey, newFormGroup);
          updateFormGroupWithValue(newFormGroup, subValue, subType, resolver);
        } else {
          // It was already a formgroup, so just update it
          updateFormGroupWithValue(oldControl as FormGroup, subValue, subType, resolver);
        }
      }
    } else {
      if (primitive) {
        formGroup.addControl(valueKey, new FormControl(subValue));
      } else {
        const newFormGroup = new FormGroup({});
        formGroup.addControl(valueKey, newFormGroup);
        updateFormGroupWithValue(newFormGroup, subValue, subType, resolver);
      }
    }
  }

  // Delete controls that are no more used
  for (const delName of toDelete) {
    formGroup.removeControl(delName);
  }
}
