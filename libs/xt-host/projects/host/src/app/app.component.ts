import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { XtResolverService } from 'xt-components';
import { registerSamplePlugin } from 'xt-plugin-sample';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'test';

  protected resolverService = inject (XtResolverService);

  protected appConfig = {
    configUrl:''
  }
    // We have to maintain an initialization flow: Load the config, then the plugins, then the project. That means 3 resources
  configUrl = signal<string|undefined>(undefined);
  configResource = resource ({
    request: () => {
      return this.configUrl();
    },
    loader: (configUrl) => {
      return fetch (configUrl.request).then(response => {return response.json()});
    }
  });

  config = computed(() => this.configResource.value());
  pluginsLoaded = computed(() =>  {
    if (this.config()!=null)
      return this.loadPlugins(this.config());
    else return false;
  });

  projectName = signal<string|undefined>(undefined);
  projectResource = resource({
    request: () => {
        return {
          projectUrl:this.config().projectApiUrl,
          projectName: this.projectName()
        }
    },
    loader: (options) => {
      if (options.request.projectName!=null) {
        let projectUrl = options.request.projectUrl;
        if (projectUrl==null) {
          projectUrl='assets/projects/'+encodeURIComponent (options.request.projectName)+'.json';
        } else {
          projectUrl = new URL (options.request.projectName, projectUrl).toString();
        }
      return fetch(projectUrl);
      } else {
        return Promise.reject('No project name to load');
      }
    }
  });

  project = computed( () => {
    return this.projectResource.value();
  });

  constructor () {
    this.configUrl.set('assets/config/default.json'); // Load the default config
  }

  loadPlugins (config:any): boolean {
    registerSamplePlugin(this.resolverService);
    this.projectName.set('Coffee Beans Evaluation');
    return true;
  }

  async initApplication (project:any) : Promise<boolean> {

  }

}
