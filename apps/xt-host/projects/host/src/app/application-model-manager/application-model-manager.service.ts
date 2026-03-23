import { inject, Injectable, signal } from '@angular/core';
import {
  DcApplicationModel, DcEntityModel,
  DcFieldModel,
  isOldProjectModel,
  OldDcApplicationModel
} from '../shared/models/dc-application-model';
import { XtTypeInfo } from 'xt-type';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ApplicationModelManagerService {

  titleMgr = inject (Title);

  protected model:DcApplicationModel|null = null;

  entityNames = signal<string[]>([]);
  projectTitle = signal<string>("Test");

  constructor() { }

  retrieveFirstEntity(): string | null {
    const entities = this.model?.content?.creation?.entities;
    if( entities == null) {
      return null;
    }

    return entities.length>0?entities[0].name:null;
  }

  setModel(value: DcApplicationModel|OldDcApplicationModel) {
    if (isOldProjectModel(value)) {
      this.model = this.toNewProjectModel (value);
    } else
      this.model = value;

    if (this.model?.content?.creation?.entities!=null){
      this.entityNames.set (Object.values(this.model?.content?.creation?.entities).map((entity) => entity.name));
    }else {
      this.entityNames.set([]);
    }
    if (this.model?.name!=null) {
      this.projectTitle.set(this.model.name);
      this.titleMgr.setTitle(this.model.name);
    }
  }

  getModel (): DcApplicationModel|null {
    return this.model;
  }

  getDefaultSharing (): string | undefined {
    return this.model?.content.creation.sharing?.with;
  }

  getApplicationTypes (): XtTypeInfo|null {
    if (this.model?.content.creation.entities!=null) {
      const ret={} as XtTypeInfo;
      for (const entity of this.model!.content.creation.entities) {
        if (entity.fields!=null) {
          ret[entity.name] = this.getEntityFields (entity.fields);
        }
      }
      return ret;
    } else {
      return null;
    }
  }

  getEntityFields(fields: Array<DcFieldModel>): XtTypeInfo {
    const ret = {} as XtTypeInfo;
    for (const field of fields) {
      ret[field.name]= this.translate (field.type);
    }
    return ret;
  }

  protected translate(type: string): string {
    switch (type) {
      case 'Date & Time':
        return 'date-time';
      case 'Website (url)':
        return 'link';
      case 'Euro':
        return 'eur-amount';
      case 'Dollar':
        return 'usd-amount';
      case 'Other currency':
        return 'money-amount';
      default:
        return type.toLowerCase();
    }
  }

  /**
   * Transform the old project model (that uses objects instead of arrays)
   * @param value
   * @protected
   */
  protected toNewProjectModel(value: OldDcApplicationModel): DcApplicationModel {
    const ret ={ name:value.name,
      description: value.description,
      content: { creation: { entities:new Array<DcEntityModel>()}}
    } as DcApplicationModel;

    for (const entity of Object.values(value.content.creation.entities??{})) {
      const newEntity = { name:entity.name, fields:new Array<DcFieldModel>} as DcEntityModel;
      for (const field of Object.values(entity.fields??{})) {
        newEntity.fields!.push(field);
      }
      ret.content!.creation!.entities!.push(newEntity);
    }
    return ret;
  }
}
