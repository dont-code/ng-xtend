import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApplicationModelManagerService {

  protected model:any = null;

  constructor() { }

  retrieveFirstEntity(): string | null {
    const entities = this.model?.content?.creation?.entities;
    if( entities == null) {
      return null;
    }

    return Object.keys(entities).length>0?entities[Object.keys(entities)[0]].name:null;
  }

  setModel(value: any) {
    this.model = value;
  }
}
