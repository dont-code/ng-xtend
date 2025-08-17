import { computed, inject, Injectable, resource, ResourceRef, ResourceStatus, signal } from '@angular/core';
import { XtResolverService } from 'xt-components';

import { registerDefaultPlugin} from 'xt-plugin-default';
import { DcPluginModel, DcRepositoryModel } from '../models/dc-repository-model';

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
      "Plugin": this.plugins,
      "Project": this.project
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
        pluginsLoaded: (this.plugins.status()==ResourceStatus.Resolved)||(this.plugins.status()==ResourceStatus.Local),
        projectUrl:this.config.value()?.projectApiUrl,
        projectName: this.configResources.projectName()
      }
      return ret;
    },
    loader: (options) => {
      if ((options.request.pluginsLoaded) && (options.request.projectName!=null)) {
        let projectUrl = options.request.projectUrl;
        if (projectUrl==null) {
          projectUrl='assets/projects/'+encodeURIComponent (options.request.projectName)+'.json';
        } else {
          projectUrl = new URL (options.request.projectName, projectUrl.endsWith('/')?projectUrl:projectUrl+'/').toString();
        }
        return fetch(projectUrl).then ((response) => {
          return response.json();
        });
      } else if (!options.request.pluginsLoaded) {
        return Promise.resolve();
      } else {
        return Promise.reject('No project name to load');
      }
    }
  });

  async loadPlugins (config:DcRepositoryModel): Promise< boolean> {
    registerDefaultPlugin(this.resolverService);
    if (config.plugins!=null) {
      const errors=new Array();
      for (const plugin of config.plugins) {
        try {
          await this.loadPlugin (plugin);
        } catch (e) {
          errors.push (e);
        }
      }
      if (errors.length > 0) {
        return Promise.reject(errors);
      }
    }
    return Promise.resolve(true);
  }

  async loadPlugin (plugin:DcPluginModel): Promise<boolean> {
    const url=plugin.info['remote-entry'];
    if (url==null) throw new Error ("No url for plugin "+ plugin['display-name']);
    await this.resolverService.loadPlugin(url);
    return true;
  }

  updateConfigName (newUrl:string ) {
    this.configResources.configName.set(newUrl);
  }

  updateProjectName (newName:string) {
    this.configResources.projectName.set(newName);
  }

}
