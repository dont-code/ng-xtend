import { Component, computed, inject, OnInit } from '@angular/core';
import { AppConfigService } from '../shared/app-config/app-config.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-load',
  imports: [],
  templateUrl: './project-load.component.html',
  styleUrl: './project-load.component.css'
})
export class ProjectLoadComponent implements OnInit {

  protected readonly route = inject(ActivatedRoute);
  appConfig = inject(AppConfigService);

  ngOnInit() {
    const projectName = this.route.snapshot.paramMap.get('projectName');
    this.appConfig.updateConfigUrl('assets/config/default.json'); // Load the default config
    if (projectName!=null)
      this.appConfig.updateProjectName(projectName);
    else
      this.appConfig.updateProjectName('Coffee Beans Evaluation');
  }

  setDefaultConfig() {

  }
}
