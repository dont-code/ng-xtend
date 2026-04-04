import { inject, Injectable, signal } from '@angular/core';
import {
  DcApplicationModel, DcEntityModel,
  DcFieldModel,
  isOldProjectModel,
  OldDcApplicationModel
} from '../shared/models/dc-application-model';
import { XtTypeDetail, XtTypeInfo, XtTypeReference } from 'xt-type';
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

    this.ensureCompatibility (this.model);
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

  getEntityFields(fields: Array<DcFieldModel>): XtTypeDetail {
    const ret = {children:{}} as XtTypeDetail;

    for (const field of fields) {
      if (field.reference==null) {
        ret.children![field.name]= this.translate (field.type);
      } else {
        ret.children![field.name] = field.reference as XtTypeReference;
      }
    }
    return ret;
  }

  protected ensureCompatibility (entity: DcApplicationModel) {
    // Reference types may be declared as OneToMany instead of "ONE-TO-MANY", due to some limitation (bug ?) in the json schema
    for (const entity of this.model?.content?.creation.entities??[]) {
      if (entity.fields!=null) {
        for (const field of entity.fields) {
          if ((field.reference?.referenceType as any)=="OneToMany") {
            field.reference!.referenceType="ONE-TO-MANY";
          } else if ((field.reference?.referenceType as any)=="ManyToOne") {
            field.reference!.referenceType="MANY-TO-ONE";
          }
        }
      }
    }
  }

  /**
   * Translates old type names into the ng-xtend new ones.
   * @param type
   * @protected
   */
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
      case 'String':
      case 'Number':
      case 'Date':
      case 'Time':
      case 'Boolean':
      case 'Currency':
      case 'Country':
      case 'Image':
      case 'Rating':
        return type.toLowerCase();
      default:
        return type;
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
      content: { creation: {
        type:value.content.creation.type,
          entities:new Array<DcEntityModel>(),
        sharing: value.content.creation.sharing
      }}
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
