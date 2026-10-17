import { Routes } from '@angular/router';
import { TestComponent } from './test-component/test.component';
import { XtFormTestComponent } from './xt-form-test/xt-form-test.component';
import { HierarchyTestComponent } from './hierarchy-test/hierarchy-test.component';
import { PluginManagerComponent } from './plugin-manager/plugin-manager.component';
import { TestConfigureComponent } from './test-configure/test-configure.component';

export const routes: Routes = [
  {
    path: '',
    component: PluginManagerComponent,
    title: 'Plugins · Plugin Tester',
  },
  {
    path: 'config',
    component: TestConfigureComponent,
    title: 'Configuration · Plugin Tester',
  },
  {
    path: 'test',
    component: TestComponent,
    title: 'Test · Plugin Tester',
  },
  {
    path: 'form',
    component: XtFormTestComponent,
    title: 'Form editor · Plugin Tester',
  },
  {
    path: 'hierarchy',
    component: HierarchyTestComponent,
    title: 'Hierarchy · Plugin Tester',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
