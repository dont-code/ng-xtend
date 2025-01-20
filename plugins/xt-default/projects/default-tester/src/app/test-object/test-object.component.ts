import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { XtRenderComponent } from 'xt-components';
import { Subscription } from 'rxjs';
import { DefaultObjectComponent } from '../../../../default/src/lib/object/default-object.component';

@Component({
  selector: 'app-test-object',
  imports: [
    AutoComplete,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    XtRenderComponent
  ],
  templateUrl: './test-object.component.html',
  styleUrl: './test-object.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestObjectComponent implements OnInit, OnDestroy {
  protected builder = inject(FormBuilder);
  protected ref = inject(ChangeDetectorRef);

  selectedObject= signal<string>('simple');

  value = signal<any>(this.loadObject('simple') );
  mainForm = signal( this.builder.group ({
    TestObject:this.builder.group({})
  }));

  protected subscriptions= new Subscription();

  constructor() {
    const newForm = new FormGroup({'TestObject': new FormGroup({})});
    this.updateFormGroupWithValue (newForm.get('TestObject')! as FormGroup, this.value());
    this.mainForm.set(newForm);
  }

  listOfObjects() {
    return ['simple', 'complex'];
  }

  objectSwitch($event: AutoCompleteSelectEvent) {
    this.selectedObject.set($event.value);
    this.value.set(this.loadObject ($event.value));
    const newForm = new FormGroup({'TestObject': new FormGroup({})});
    this.updateFormGroupWithValue (newForm.get('TestObject')! as FormGroup, this.value());
    this.mainForm.set(newForm);
  }

  updateFormGroupWithValue(formGroup: FormGroup, value:{[key:string]:any}) {

    const toDelete = new Set<string>(Object.keys(formGroup.controls));

    for (const valueKey in value) {
      const primitive = this.isPrimitive (value[valueKey]);
      if (toDelete.delete(valueKey)) {
        // Already a control
        const oldControl = formGroup.get(valueKey)!;
        // Is it the right type ?
        if (primitive) {
          // Must be an FormControl2
          if ((oldControl as any).controls===undefined) {
            // It's ok, just set the value
            oldControl.setValue(value[valueKey]);
          }else {
            formGroup.setControl(valueKey, new FormControl(value[valueKey]));
          }
        } else {
          // Must be a FormGroup
          if ((oldControl as any).controls===undefined) {
            const newFormGroup = new FormGroup({});
            formGroup.setControl(valueKey, newFormGroup);
            this.updateFormGroupWithValue(newFormGroup, value[valueKey]);
          } else {
            // It was already a formgroup, so just update it
            this.updateFormGroupWithValue(oldControl as FormGroup, value[valueKey]);
          }
        }
      } else {
        if (primitive) {
          formGroup.addControl(valueKey, new FormControl(value[valueKey]));
        } else {
          const newFormGroup = new FormGroup({});
          formGroup.addControl(valueKey, newFormGroup);
          this.updateFormGroupWithValue(newFormGroup, value[valueKey]);
        }
      }
    }

    // Delete controls that are no more used
    for (const delName of toDelete) {
      formGroup.removeControl(delName);
    }
  }

  loadObject (objName:string) :any {
    return {
      simple: {
        prop1:'Value1',
        prop2:1234,
        prop3:new Date()
      },
      complex: {
        prop1:'Value1',
        sub1:{
          prop11:1232,
          prop12:true
        },
        sub2:{
          prop21:'Value21',
          sub22: {
            prop221:new Date(),
            prop222:true
          }
        }
      }
    }[objName];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit(): void {
//    this.mainForm.setValue({TestObject:this.value()}, {emitEvent: false});
    this.listenToValueChanges();
  }

  protected listenToValueChanges() {
    // this.subscriptions.unsubscribe();
    this.subscriptions.add(this.mainForm().valueChanges.subscribe({
      next: newValue => {
        if (newValue.TestObject !== undefined)
          this.value.set(newValue.TestObject);
      }
    }));
  }

  objectComponentType() {
    return DefaultObjectComponent;
  }

  protected isPrimitive(valueElement: any): boolean {
    if (typeof valueElement == 'object') {
      if (valueElement==null) return true;
      else {
        return valueElement instanceof Date;
      }
    } else return true;
  }
}
