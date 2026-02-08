import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { AutoComplete, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { JsonPipe } from '@angular/common';
import { XtComponentOutput, XtRenderComponent } from 'xt-components';
import { FormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { DefaultObjectSetComponent } from '../../../../default/src/lib/object-set/default-object-set.component';
import { AppComponent } from '../app.component';

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
    return ['simple', 'long', 'complex', 'references'];
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
      }],
      references: [{
        name:'Ubik',
        authorRef:AppComponent.authorPkDick,
        genreRef: {
          name: 'SF'
        }
      },{
        name:'Ancillaire',
        authorRef:AppComponent.authorAnnLeckie,
        genreRef: {
          name: 'Space Opera'
        }
      },{
        name:'Total Recall',
        authorRef:AppComponent.authorPkDick,
        genreRef: {
          name: 'SF'
        }
      }]
    }[objName];
  }

  objectComponentType() {
    return DefaultObjectSetComponent;
  }

  selectedValue = signal<any>(null);

  componentOutputChange (newOutput:XtComponentOutput|null) {
    if (newOutput?.valueSelected!=null) {
      newOutput.valueSelected.subscribe ((value) => {
        this.selectedValue.set(value);
      })
    }
  }

  valueType= computed(() => {
    const displayedType=this.selectedObject();
    return displayedType=='references'?'bookType':undefined;
  });
}
