import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  linkedSignal,
  OnInit,
  resource,
  runInInjectionContext
} from '@angular/core';
import { AppConfigService } from '../shared/app-config/app-config.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationModelManagerService } from '../application-model-manager/application-model-manager.service';
import { StoreManagerService } from '../store/store-manager.service';
import { XtApiStoreProvider, XtMemoryStoreProvider } from 'xt-store';

@Component({
  selector: 'app-project-load',
  imports: [],
  templateUrl: './project-load.component.html',
  styleUrl: './project-load.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectLoadComponent implements OnInit {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  protected readonly appMgr=inject(ApplicationModelManagerService);
  protected readonly appConfig = inject(AppConfigService);
  protected readonly storeMgr = inject(StoreManagerService);

  private readonly injector = inject(Injector);

  ngOnInit() {
    const projectName = this.route.snapshot.paramMap.get('projectName');
    this.appConfig.updateConfigUrl('assets/config/default.json'); // Load the default config
    if (projectName!=null)
      this.appConfig.updateProjectName(projectName);
    else
      this.appConfig.updateProjectName('Coffee Beans Evaluation');
  }

  combinedloadingStatus = linkedSignal( () => {
      const ret = this.appConfig.loadingStatus();
      if (!ret.allLoaded) {
         return ret;
      }
      else {
        return {
          status:this.moveToNextPage.status(),
          allLoaded:true,
          item: 'Entity',
          message:(this.moveToNextPage.value()===false)?'No displayable entity found':undefined
      }
    }
  });

  moveToNextPage = resource({
    request: ()=> {
      return this.appConfig.loadingStatus().allLoaded;
    },
    loader: ((option) => {
      if (option.request==true) {
        this.appMgr.setModel (this.appConfig.project.value());
        this.updateDefaultStore (this.appMgr.getDefaultSharing());
        const entityName = this.appMgr.retrieveFirstEntity();
        if (entityName != null)
          return this.router.navigate(['entity', entityName]);
      }
      return Promise.resolve(false);
  })
});

  updateDefaultStore(sharingMode: string | undefined) {
    if( sharingMode == 'Dont-code users') {
      const apiUrl = this.appConfig.config.value().storeApiUrl;
      if (apiUrl != null) {
          runInInjectionContext(this.injector, () => {
          try {
          const apiProvider = inject(XtApiStoreProvider);
          apiProvider.apiUrl = apiUrl;
          this.storeMgr.setDefaultStoreProvider(apiProvider);
          } catch(err) {
            console.error (err);
          }

          });
      }
    } else {
      // For now, just memory
      this.storeMgr.setDefaultStoreProvider(new XtMemoryStoreProvider());
    }
  }

}
