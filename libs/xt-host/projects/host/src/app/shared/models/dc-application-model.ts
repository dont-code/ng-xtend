export type DcApplicationModel = {
  name:string,
  description?: string,
  content: {
    creation: {
      type?: string,
      entities?: {
        [key:string]:DcEntityModel
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
  }
}

export type DcFieldModel = {
  name: string,
  type: string
}
