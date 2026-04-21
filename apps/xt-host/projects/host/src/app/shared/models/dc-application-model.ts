import { XtTypeReference } from 'xt-type';
import { DcWorkflowModel } from 'dc-workflow';

export type DcApplicationModel = {
  name:string,
  description?: string,
  imgUrl?:string,
  content: {
    creation: {
      type?: string,
      name?: string,
      entities?: Array<DcEntityModel>,
      workflows?: {
        [key:string]: DcWorkflowModel
      },
      sharing?: {
        with: 'Dont-code users'|'No-one'|'Volatile'
      }
    }
  }
}

export type DcEntityModel = {
  name: string,
  fields?: Array<DcFieldModel>,
  compatibleWith?: string[],
  from?:string
}

export type DcFieldModel = {
  name: string,
  type: string,
  reference?: XtTypeReference|null
}

export type OldDcApplicationModel = {
  name:string,
  description?: string,
  imgUrl?:string,
  content: {
    creation: {
      type?: string,
      name?:string,
      entities?: {
        [key:string]:OldDcEntityModel
      },
      workflows?: {
        [key:string]: DcWorkflowModel
      },
      sharing?: {
        with: 'Dont-code users'|'No-one'|'Volatile'
      }
    }
  }
}

export type OldDcEntityModel = {
  name: string,
  fields?: {
    [key:string]:DcFieldModel
  },
  compatibleWith?: string[]
}

export function isOldProjectModel(prj:DcApplicationModel|OldDcApplicationModel):prj is OldDcApplicationModel {
  if (prj.content.creation.entities != null) {
    return !Array.isArray(prj.content.creation.entities);
  } else return false;
}

