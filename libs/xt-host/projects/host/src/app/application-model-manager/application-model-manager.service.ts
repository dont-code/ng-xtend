import { Injectable } from '@angular/core';
import { DcApplicationModel } from '../shared/application-model/dc-application-model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationModelManagerService {

  protected model:DcApplicationModel|null = null;

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
  }

  getModel (): DcApplicationModel|null {
    return this.model;
  }

  getDefaultSharing (): string | undefined {
    return this.model?.content.creation.sharing?.with;
  } 
}
