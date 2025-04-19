import { computed, inject, Injectable, resource, ResourceRef, ResourceStatus, signal } from '@angular/core';
import { XtResolverService } from 'xt-components';

import { registerDefaultPlugin} from 'xt-plugin-default';
import { registerWebPlugin} from 'xt-plugin-web';
import { DcRepositoryModel } from '../models/dc-repository-model';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  protected configResources = {
    configName: signal<string|undefined>(undefined),
    projectName: signal<string|undefined>(undefined)
  }

  protected resolverService = inject (XtResolverService);

  loadingStatus = computed<{status:string, item:string, allLoaded:boolean, message?:string}> (() => {

    let overallStatus = 'Idle';

    const statuses: {[key:string]:ResourceRef<any>} = {
      "Config": this.config,
      "Project": this.project,
      "Plugin": this.plugins
    }

    for (const name in statuses) {
      switch (statuses[name].status()) {
        case ResourceStatus.Error:
          return {
            status: 'Error',
            item: name,
            allLoaded:false,
            message: (statuses[name].error() as any).toString()
          };
        case  ResourceStatus.Reloading:
        case  ResourceStatus.Loading:
          return {
            status: 'Loading',
            item: name,
            allLoaded:false
          }
        case ResourceStatus.Resolved:
        case ResourceStatus.Local:
          overallStatus = "Loaded";
          break;
      }
    }

    return {
      status: overallStatus,
      allLoaded:(overallStatus=='Loaded'),
      item: 'All'
    }
  });

  constructor() { }

  // We have to maintain an initialization flow: Load the config, then the plugins, then the project. That means 3 resources
  // First we load the config
  config = resource ({
    request: () => {
      return this.configResources.configName();
    },
    loader: (configName) => {
      if (configName.request!=null) {
        const configUrl = 'assets/config/'+configName.request+'.json'
        return fetch (configUrl).then(response => {
          return response.json();
        }).then ((config) => {
          console.debug("Config read", config);
          return config as DcRepositoryModel;
        });
      } else {
        return Promise.resolve(undefined);
      }
    }
  });

  // Then the plugins
  plugins = resource({
    request: () => {
      return this.config.value();
    },
    loader:(prop) =>  {
      if (prop.request!=null)
        return this.loadPlugins(prop.request);
      else return Promise.resolve(false);
    }});

  // Then the project
  project = resource({
    request: () => {
      const ret= {
        plugins: this.plugins.value(),
        projectUrl:this.config.value()?.projectApiUrl,
        projectName: this.configResources.projectName()
      }
      return ret;
    },
    loader: (options) => {
      if ((options.request.plugins==true) && (options.request.projectName!=null)) {
        let projectUrl = options.request.projectUrl;
        if (projectUrl==null) {
          projectUrl='assets/projects/'+encodeURIComponent (options.request.projectName)+'.json';
        } else {
          projectUrl = new URL (options.request.projectName, projectUrl.endsWith('/')?projectUrl:projectUrl+'/').toString();
        }
        return fetch(projectUrl).then ((response) => {
          return response.json();
        });
      } else {
        return Promise.reject('No project name to load');
      }
    }
  });

  async loadPlugins (config:DcRepositoryModel): Promise< boolean> {
    registerDefaultPlugin(this.resolverService);
    registerWebPlugin(this.resolverService);
    return Promise.resolve(true);
  }

  updateConfigName (newUrl:string ) {
    this.configResources.configName.set(newUrl);
  }

  updateProjectName (newName:string) {
    this.configResources.projectName.set(newName);
  }

}
