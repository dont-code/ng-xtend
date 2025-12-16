import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, computed,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { XtRenderComponent, XtResolverService } from 'xt-components';
import { Subscription } from 'rxjs';
import { updateFormGroupWithValue } from 'xt-components';
import { Panel } from 'primeng/panel';
import { DefaultObjectComponent } from '../../../../default/src/lib/object/default-object.component';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-test-object',
  imports: [
    AutoComplete,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    XtRenderComponent,
    Panel
  ],
  templateUrl: './test-object.component.html',
  styleUrl: './test-object.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestObjectComponent implements OnInit, OnDestroy {
  protected builder = inject(FormBuilder);
  //protected ref = inject(ChangeDetectorRef);
  protected resolver = inject(XtResolverService);

  selectedObject= signal<string>('simple');

  value = signal<any>(this.loadObject('simple') );
  mainForm = signal( this.builder.group ({
    TestObject:this.builder.group({})
  }));

  protected subscriptions= new Subscription();

  constructor() {
    const newForm = new FormGroup({'TestObject': new FormGroup({})}, {updateOn: 'change'});
    updateFormGroupWithValue (newForm.get('TestObject')! as FormGroup, this.value(), this.valueType(),this.resolver.typeResolver);
    this.mainForm.set(newForm);
  }

  listOfObjects() {
    return ['simple', 'complex', 'references'];
  }

  objectSwitch($event: AutoCompleteSelectEvent) {
    this.selectedObject.set($event.value);
    this.value.set(this.loadObject ($event.value));
    const newForm = new FormGroup({'TestObject': new FormGroup({})}, {updateOn: 'change'});
    updateFormGroupWithValue (newForm.get('TestObject')! as FormGroup, this.value(), this.valueType(),this.resolver.typeResolver);
    this.mainForm.set(newForm);
    this.listenToValueChanges();
  }

  loadObject (objName:string) :any {
    return {
      simple: {
        prop1:'Value1',
        prop2:1234,
        prop3:new Date (2023, 11,6,12,34,56)
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
      },
      references: {
        name:'Ubik',
        authorRef:AppComponent.authorPkDick,
        genreRef: {
          name: 'SF'
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
    this.subscriptions.unsubscribe();
    this.subscriptions=new Subscription();
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

  valueType= computed(() => {
    const displayedType=this.selectedObject();
    return displayedType=='references'?'bookType':undefined;
  });

}
