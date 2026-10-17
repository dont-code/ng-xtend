import { Routes } from '@angular/router';
import { TestComponent } from './test-component/test.component';
import { XtFormTestComponent } from './xt-form-test/xt-form-test.component';
import { HierarchyTestComponent } from './hierarchy-test/hierarchy-test.component';
import { PluginManagerComponent } from './plugin-manager/plugin-manager.component';
import { TestConfigureComponent } from './test-configure/test-configure.component';

export const routes: Routes = [{
    path:'', component:PluginManagerComponent
}, {
  path:'config',component:TestConfigureComponent
},{
  path:'test', component:TestComponent
}, {
    path:'form', component:XtFormTestComponent
}, {
    path:'hierarchy', component:HierarchyTestComponent
}
];
