export type DcWorkflowModel = {
  entity: string,
  workflow: 'list-detail'|'carousel',
  data?: {
    sort?: DcWorkflowSortModel
  },
  display?: DcWorkflowDisplayModel,
  selection?: DcWorkflowSelectionModel
}

export type DcWorkflowSortModel = {
  [key in DcMetadataTypes|string]: DcWorkflowSortOption
}

export type DcWorkflowSortOption = 'ascending' | 'descending' | {
  direction: 'ascending' | 'descending',
  type: 'metadata'|'field',
}

export type DcWorkflowDisplayModel = {
  fields?: {
    [key:string]:'current-and-after'
  }
}

export type DcWorkflowSelectionModel = {
  field?: {
    key: string,
    type: 'closest-after' | 'closest-before'
  },

  metadata?: {
    [key in DcMetadataTypes]: 'last' | 'fist' | 'current-user'
  }
}

export type DcMetadataTypes = 'creation-date' | 'last-update-date' | 'owner';
