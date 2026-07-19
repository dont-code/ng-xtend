/**
 * Core configuration model for dc-workflow components.
 * Defines the entity to manage, workflow type, and optional behaviors
 * for sorting, display filtering, and automatic selection.
 */
export type DcWorkflowModel = {
  /** Entity name to manage (resolved via XtResolverService) */
  entity: string,
  /** Workflow display type: 'list-detail' for tabbed list/edit, 'carousel' for card-based navigation */
  workflow: 'list-detail'|'carousel',
  /** Data configuration including sorting rules */
  data?: {
    /** Sort configuration applied to entity queries */
    sort?: DcWorkflowSortModel
  },
  /** Display filtering rules applied to fetched entities */
  display?: DcWorkflowDisplayModel,
  /** Automatic selection rules for pre-selecting an entity */
  selection?: DcWorkflowSelectionModel
}

/** Sort configuration map: each key is a field name or metadata type mapped to a sort direction */
export type DcWorkflowSortModel = {
  [key in DcMetadataTypes|string]: DcWorkflowSortOption
}

/** Sort direction: simple string shorthand or detailed object with direction and sort type */
export type DcWorkflowSortOption = 'ascending' | 'descending' | {
  direction: 'ascending' | 'descending',
  /** 'metadata' for built-in fields (not yet supported), 'field' for entity fields */
  type: 'metadata'|'field',
}

/**
 * Display filter configuration.
 * Currently supports 'current-and-after' filtering which hides entities
 * whose date field value is in the past.
 */
export type DcWorkflowDisplayModel = {
  fields?: {
    [key:string]:'current-and-after'
  }
}

/**
 * Automatic selection configuration.
 * Determines which entity should be pre-selected when the workflow loads.
 */
export type DcWorkflowSelectionModel = {
  /** Select based on a date field value relative to current date */
  field?: {
    /** The entity field key to evaluate (must be a Date-compatible field) */
    key: string,
    /** 'closest-after': next future date, 'closest-before': most recent past date */
    type: 'closest-after' | 'closest-before'
  },

  /** Select based on built-in metadata fields */
  metadata?: {
    [key in DcMetadataTypes]: 'last' | 'fist' | 'current-user'
  }
}

/** Built-in metadata field types for sorting and selection */
export type DcMetadataTypes = 'creation-date' | 'last-update-date' | 'owner';
