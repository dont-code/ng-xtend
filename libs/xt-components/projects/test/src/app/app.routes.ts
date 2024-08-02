import { Routes } from '@angular/router';
import { TestComponent } from '../test-component/test.component';
import { XtFormTestComponent } from '../xt-form-test/xt-form-test.component';

export const routes: Routes = [{
    path:'', component:TestComponent    
}, {
    path:'form', component:XtFormTestComponent
}
];
