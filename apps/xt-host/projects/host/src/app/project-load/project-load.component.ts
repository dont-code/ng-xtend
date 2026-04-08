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
import { XtStoreManagerService } from 'xt-store';
import { XtApiStoreProvider, XtMemoryStoreProvider } from 'xt-store';
import { XtResolverService } from 'xt-components';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Component({
  selector: 'app-project-load',
  imports: [],
  providers: [],
  templateUrl: './project-load.component.html',
  styleUrl: './project-load.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectLoadComponent implements OnInit {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);

  protected readonly appMgr=inject(ApplicationModelManagerService);
  protected readonly appConfig = inject(AppConfigService);
  protected readonly storeMgr = inject(XtStoreManagerService);
  protected readonly resolver=inject(XtResolverService);
  protected readonly errorHandler = inject(ErrorHandlerService);

  private readonly injector = inject(Injector);

  ngOnInit() {
      // Either we get the complete project definition, or only the name to be read from project API
    let projectName:string = 'Coffee Beans Evaluation';
    let project = this.route.snapshot.queryParamMap.get('prjDef');
    if (project==null) {
      let givenPrjName = this.route.snapshot.paramMap.get('projectName');
      if ((givenPrjName==null) || (givenPrjName.length==0)) {
        projectName = this.route.snapshot.queryParamMap.get('project')??projectName;
      } else projectName=givenPrjName;
    }

    const repoName = this.route.snapshot.paramMap.get('repoName') ?? this.route.snapshot.queryParamMap.get('repository')?? 'default';
    this.appConfig.updateConfigName(repoName); // Load the default config
    if (project!=null) {
      this.appConfig.updateProjectDefinition(project);
    }else {
      this.appConfig.updateProjectName(projectName);
    }
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
    params: ()=> {
      return this.appConfig.loadingStatus().allLoaded;
    },
    loader: ((option) => {
      if (option.params) {
        this.appMgr.setModel (this.appConfig.project.value());
        this.updateDefaultStore (this.appMgr.getDefaultSharing());
        // Register the types defined in the project
        const newTypes = this.appMgr.getApplicationTypes ();
        if (newTypes!=null) {
          this.resolver.registerTypes(newTypes);
          this.resolver.resolvePendingReferences();
        }

        const entityName = this.appMgr.retrieveFirstEntity();
        if (entityName != null)
          return this.router.navigate(['entity', entityName]);
      }
      return Promise.resolve(false);
  })
});

  updateDefaultStore(sharingMode: string | undefined) {
    if( sharingMode == 'Dont-code users') {
      const apiUrl = this.appConfig.config.value()?.storeApiUrl;
      if (apiUrl != null) {
          runInInjectionContext(this.injector, () => {
          try {
            const apiProvider = inject(XtApiStoreProvider);
            apiProvider.apiUrl = apiUrl;

            const docUrl=this.appConfig.config.value()?.documentApiUrl;
            if (docUrl!=null) {
              apiProvider.docUrl = docUrl;
            }
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

function bufferToString(buffer: ArrayBuffer): string {
  return String.fromCharCode.apply(null, Array.from(new Uint16Array(buffer)));
}

function stringToBuffer(value: string): ArrayBuffer {
  let buffer = new ArrayBuffer(value.length * 2); // 2 bytes per char
  let view = new Uint16Array(buffer);
  for (let i = 0, length = value.length; i < length; i++) {
    view[i] = value.charCodeAt(i);
  }
  return buffer;
}

