import { XtTypeReference } from 'xt-type';
import { DcWorkflowModel } from 'dc-workflow';

export type DcApplicationModel = {
  name:string,
  description?: string,
  content: {
    creation: {
      type?: string,
      entities?: {
        [key:string]:DcEntityModel
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

export type DcEntityModel = {
  name: string,
  fields?: {
    [key:string]:DcFieldModel
  },
  compatibleWith?: string[]
}

export type DcFieldModel = {
  name: string,
  type: string,
  reference?: XtTypeReference
}

