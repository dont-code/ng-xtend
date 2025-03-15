import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { JsonPipe } from '@angular/common';
import { XtComponentOutput, XtRenderComponent } from 'xt-components';
import { DefaultObjectSetComponent } from 'xt-plugin-default';
import { FormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';

@Component({
  selector: 'app-test-object-set',
  imports: [
    FormsModule,
    AutoComplete,
    JsonPipe,
    XtRenderComponent,
    Panel
  ],
  templateUrl: './test-object-set.component.html',
  styleUrl: './test-object-set.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestObjectSetComponent {
  selectedObject= signal<string>('simple');

  value = signal<any>(this.loadObject('simple') );

  listOfObjects() {
    return ['simple', 'long', 'complex'];
  }

  objectSwitch($event: AutoCompleteSelectEvent) {
    this.selectedObject.set($event.value);
    this.value.set(this.loadObject ($event.value));
  }

  loadObject (objName:string) :any {
    if (objName=='long') {
      const ret = [];
      for (let i = 0;i<50;i++) {
        ret.push({
          prop1:'Value'+i,
          prop2: i*12,
          prop3: new Date (i*134005)
        })
      }
      return ret;
    } else return {
      simple: [{
        prop1:'Value1',
        prop2:1234,
        prop3:new Date()
      },{
        prop1:'Value2',
        prop2:567,
        prop3:new Date(1,1,1970)
      },{
        prop1:'Value1',
        prop2:89,
        prop3:new Date(12,6,2034)
      }],
      complex: [{
        prop1:'Value1',
        sub1:{
          prop11:1232,
          prop12:true
        },
        sub2:{
          prop21:'Value11',
          sub22: {
            prop221:new Date(),
            prop222:true
          }
        }},{
        prop1:'Value2',
        sub1:{
          prop11:3422,
          prop12:false
        },
        sub2:{
          prop21:'Value221',
          sub22: {
            prop221:new Date(),
            prop222:true
          }
        }},{
        prop1:'Value3',
        sub1:{
          prop11:5655,
          prop12:true
        },
        sub2:{
          prop21:'Value321',
          sub22: {
            prop221:new Date(12,10,2023),
            prop222:false
          }
        }
      }]
    }[objName];
  }

  objectComponentType() {
    return DefaultObjectSetComponent;
  }

  selectedValue = computed(() => {
    return this.selectedValueSignal()();
  })

  selectedValueSignal= computed( ()=> {
    const outputs=this.componentOutputs();
    if ((outputs!=null) && (outputs.valueSelected!=null)) {
      return outputs.valueSelected;
    }
    return signal<any>(null);
  })

  componentOutputs = signal<XtComponentOutput|null>(null);

  componentOutputChange (newValue:XtComponentOutput|null) {
    this.componentOutputs.set(newValue);
  }
}
