import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { ApplicationModelManagerService } from '../application-model-manager/application-model-manager.service';
import { Menu } from 'primeng/menu';
import { MenuItem, PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-host-menu',
  imports: [
    Menu
  ],
  templateUrl: './host-menu.component.html',
  styleUrl: './host-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostMenuComponent {
  appMgr = inject(ApplicationModelManagerService);
  menuClick= output();

  menus= computed<MenuItem[]> (() => {
    const entities = this.appMgr.entityNames();
    if (entities.length > 0){
      const entityMenu:MenuItem = {
        label: 'Edit',
        icon: PrimeIcons.PEN_TO_SQUARE,
        items: []
      };
      for (const entityName of entities){
        entityMenu.items!.push({
          label: entityName,
          routerLink: ['entity', entityName],
        });
      }
      return [entityMenu];
    } else {
      return [];
    }
  });


  menuClicked($event: MouseEvent) {
    this.menuClick.emit();
  }
}
