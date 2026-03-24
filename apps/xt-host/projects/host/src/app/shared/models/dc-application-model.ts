import { XtTypeReference } from 'xt-type';

export type DcApplicationModel = {
  name:string,
  description?: string,
  content: {
    creation: {
      type?: string,
      entities?: Array<DcEntityModel>,
      sharing?: {
        with: 'Dont-code users'|'No-one'|'Volatile'
      }
    }
  }
}

export type DcEntityModel = {
  name: string,
  fields?: Array<DcFieldModel>,
  compatibleWith?: string[]
}

export type DcFieldModel = {
  name: string,
  type: string,
  reference?: XtTypeReference
}

export type OldDcApplicationModel = {
  name:string,
  description?: string,
  content: {
    creation: {
      type?: string,
      entities?: {
        [key:string]:OldDcEntityModel
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
