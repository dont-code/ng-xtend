import { Routes } from '@angular/router';
import { ProjectLoadComponent } from './project-load/project-load.component';
import { EntityManagerComponent } from './entity-manager/entity-manager.component';

export const routes: Routes = [{
    path:'', redirectTo:'project/', pathMatch: 'full'
}, {
    path:'project/:projectName', component:ProjectLoadComponent
} , {
  path:'repository/:repoName/:projectName', component:ProjectLoadComponent
},{
  path:'entity/:entityName', component: EntityManagerComponent
}
];
