import { inject, Injectable, signal } from '@angular/core';
import { DcApplicationModel, DcFieldModel } from '../shared/models/dc-application-model';
import { XtTypeInfo } from 'xt-components';
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

    return Object.keys(entities).length>0?entities[Object.keys(entities)[0]].name:null;
  }

  setModel(value: DcApplicationModel) {
    this.model = value;
    if (this.model?.content?.creation?.entities!=null){
      this.entityNames.set (Object.values(this.model?.content?.creation?.entities).map((entity) => entity.name));
    }else {
      this.entityNames.set([]);
    }
    if (this.model.name!=null) {
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
      for (const entity of Object.values(this.model!.content.creation.entities)) {
        if (entity.fields!=null) {
          ret[entity.name] = this.getEntityFields (entity.fields);
        }
      }
      return ret;
    } else {
      return null;
    }
  }

  getEntityFields(fields: { [key:string]:DcFieldModel}): XtTypeInfo {
    const ret = {} as XtTypeInfo;
    for (const field of Object.values(fields)) {
      ret[field.name]= field.type;
    }
    return ret;
  }
}
