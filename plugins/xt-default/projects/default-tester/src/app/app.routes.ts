import { Routes } from '@angular/router';
import { TestComponent } from './test-component/test.component';
import { TestObjectComponent } from './test-object/test-object.component';

export const routes: Routes = [{
  path:'', component:TestComponent
},{
  path:'object', component:TestObjectComponent
}];
