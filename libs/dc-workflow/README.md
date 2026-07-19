![ng-xtend logo](https://dont-code.net/assets/images/logos/logo-xtend-angular-red-small.png)

# dc-workflow

Core workflow library for the [ng-xtend framework](https://github.com/dont-code/ng-xtend/blob/main/README.md).

Provides the base infrastructure for building workflow components that manage entity data through a signal-based store.

## Overview

The library implements a plugin-based workflow system where:
- **Models** define workflow configuration (entity, sorting, display filtering, selection)
- **Abstract classes** provide store management and entity operations
- **Renderers** dynamically resolve and render the appropriate workflow component
- **Resolvers** find the best workflow implementation from the plugin registry

## Architecture

```
wfw-render (this library)
  └─ resolves workflow component via WfwResolverService.findBestWorkflow(config)
       └─ CarouselComponent or ListDetailsComponent (from xt-workflow plugin)
            └─ AbstractDcWorkflow (this library)
                 └─ XtSignalStore for entity data access
```

## Key Components

### Models (`dc-workflow-model.ts`)

```typescript
type DcWorkflowModel = {
  entity: string,           // Entity name to manage
  workflow: 'list-detail' | 'carousel',  // Workflow type
  data?: { sort?: DcWorkflowSortModel },
  display?: DcWorkflowDisplayModel,
  selection?: DcWorkflowSelectionModel
}
```

### AbstractDcWorkflow

Base class for all workflow implementations. Provides:
- Store initialization and management
- Entity fetching with error handling
- Display filtering (`current-and-after`)
- Automatic selection (`closest-after`, `closest-before`)
- Sort option generation

### WfwRender

Dynamic component renderer that:
- Accepts `workflowType` (explicit component) or `workflowConfig` (auto-resolved)
- Uses `WfwResolverService` to find registered workflow components
- Renders via `ngComponentOutlet` with config injection

### WfwResolverService

Service that queries the plugin registry to find workflow implementations for a given type (`list-detail`, `carousel`).

## Usage

```typescript
// Explicit component
<wfw-render [workflowType]="CarouselComponent" [workflowConfig]="config" />

// Auto-resolved from config
<wfw-render [workflowConfig]="{ entity: 'Todo', workflow: 'carousel' }" />
```

## Dependencies

- `xt-components` - Core component infrastructure and plugin registry
- `xt-store` - Signal-based entity store
- `xt-type` - Type definitions

## Development

```bash
# Build the library
ng build dc-workflow

# Run tests
ng test dc-workflow
```
