import { FormControl, FormGroup } from '@angular/forms';
import { isPrimitive, isTypeReference, XtTypeHierarchy, XtTypeReference, XtTypeResolver } from 'xt-type';

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
    const subValue=(value!=null)?value[valueKey]:undefined;
    const subType=resolver?.findType(valueType, valueKey, subValue)??undefined;
    const subTypeName = isTypeReference(subType) ? subType.toType : subType?.type;
    const primitive = (resolver!=null)?resolver?.isPrimitiveType(subType, subValue): isPrimitive(subValue);
    if (toDelete.delete(valueKey)) {
      // Already a control
      const oldControl = formGroup.get(valueKey)!;
      // Is it the right type ?
      if ((primitive) || (isTypeReference(subType))) {
        // Must be an FormControl2
        if ((oldControl as any).controls === undefined) {
          // It's ok, just set the value
          oldControl.setValue(subValue);
        } else {
          formGroup.setControl(valueKey, new FormControl(subValue));
        }
      } else {
        // Must be a FormGroup
        if ((oldControl as any).controls === undefined) {
          const newFormGroup = new FormGroup({});
          formGroup.setControl(valueKey, newFormGroup);
          updateFormGroupWithValue(newFormGroup, subValue, subTypeName, resolver);
        } else {
          // It was already a formgroup, so just update it
          if (subValue!==undefined)
            updateFormGroupWithValue(oldControl as FormGroup, subValue, subTypeName, resolver);
          else {
            // Just remove the control as there is no value to set
            formGroup.removeControl(valueKey);
          }
        }
      }
    } else {
      if ((primitive) || (isTypeReference(subType))) {
        formGroup.addControl(valueKey, new FormControl(subValue));
      } else {
        const newFormGroup = new FormGroup({});
        formGroup.addControl(valueKey, newFormGroup);
        updateFormGroupWithValue(newFormGroup, subValue, subTypeName, resolver);
      }
    }
  }

  // Delete controls that are no more used
  for (const delName of toDelete) {
    formGroup.removeControl(delName);
  }
}
