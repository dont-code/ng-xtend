import { Routes } from '@angular/router';
import { TestComponent } from './test-component/test.component';
import { ProjectLoadComponent } from './project-load/project-load.component';
import { EntityManagerComponent } from './entity-manager/entity-manager.component';

export const routes: Routes = [{
    path:'', redirectTo:'project/Coffee Beans Evaluation', pathMatch: 'full'
}, {
    path:'project/:projectName', component:ProjectLoadComponent
}, {
  path:'entity/:entityName', component: EntityManagerComponent
}
];
