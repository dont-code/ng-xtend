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
  [key in DcMetadataTypes|string]: 'ascending' | 'descending' | {
  direction: 'ascending' | 'descending',
  type: 'metadata'|'field',
}
}

export type DcWorkflowDisplayModel = {
  fields?: {
    [key:string]:'current-and-after'
  }
}

export type DcWorkflowSelectionModel = {
  fields?: {
    [key:string]: 'closest-after' | 'closest-before'
  },

  metadata?: {
    [key in DcMetadataTypes]: 'latest-created' | 'latest-updated'
  }
}

export type DcMetadataTypes = 'creation-date' | 'last-update-date' | 'user-owned';
