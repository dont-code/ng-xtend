import { computed, inject, Injectable, resource, ResourceRef, signal } from '@angular/core';
import { XtResolverService } from 'xt-components';

import { registerDefaultPlugin } from 'xt-plugin-default';
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
        case 'error':
          return {
            status: 'Error',
            item: name,
            allLoaded:false,
            message: (statuses[name].error() as any).toString()
          };
        case  'reloading':
        case  'loading':
          return {
            status: 'Loading',
            item: name,
            allLoaded:false
          }
        case 'resolved':
        case 'local':
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
    params: () => {
      return this.configResources.configName();
    },
    loader: (configName) => {
      if (configName.params!=null) {
        const configUrl = 'assets/config/'+configName.params+'.json'
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
    params: () => {
      return this.config.value();
    },
    loader:(prop) =>  {
      if (prop.params!=null)
        return this.loadPlugins(prop.params);
      else return Promise.resolve(false);
    }});

  // Then the project
  project = resource({
    params: () => {
      const ret= {
        pluginsLoaded: (this.plugins.status()=='resolved')||(this.plugins.status()=='local'),
        projectUrl:this.config.value()?.projectApiUrl,
        projectName: this.configResources.projectName()
      }
      return ret;
    },
    loader: (options) => {
      if ((options.params.pluginsLoaded) && (options.params.projectName!=null)) {
        let projectUrl = options.params.projectUrl;
        if (projectUrl==null) {
          projectUrl='assets/projects/'+encodeURIComponent (options.params.projectName)+'.json';
        } else {
          projectUrl = new URL (options.params.projectName, projectUrl.endsWith('/')?projectUrl:projectUrl+'/').toString();
        }
        return fetch(projectUrl).then ((response) => {
          return response.json();
        });
      } else if (!options.params.pluginsLoaded) {
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
      // Once all plugins are loaded, we resolve all type references
      this.resolverService.resolvePendingReferences();
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
