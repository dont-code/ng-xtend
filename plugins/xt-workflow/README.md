![ng-xtend logo](https://dont-code.net/assets/images/logos/logo-xtend-angular-red-small.png)

# Plugin xt-workflow

Workflow UI implementations for the [ng-xtend framework](https://github.com/dont-code/ng-xtend/blob/main/README.md).

Provides ready-to-use workflow components that extend `AbstractDcWorkflow` from `dc-workflow`.

## Components

### ListDetailsComponent

Tabbed list/edit workflow interface.

**Features:**
- List tab with entity table and live preview of edits
- Edit tab with full entity form
- Toolbar with New, Reload, Delete, Save operations
- Automatic view switching on entity selection
- Loading and empty states

**Selector:** `wfw-list-details`

```html
<wfw-list-details [config]="workflowConfig" />
```

### CarouselComponent

Card-based carousel workflow interface.

**Features:**
- Navigable entity cards
- Edit button on selected card
- Modal dialog for editing
- Delete from edit dialog
- Loading and empty states

**Selector:** `wfw-carousel`

```html
<wfw-carousel [config]="workflowConfig" />
```

## Registration

The plugin registers both components with the resolver service:

```typescript
import { registerWorkflowPlugin } from 'xt-workflow';

// In your app initialization
registerWorkflowPlugin(resolverService);
```

**Registered workflows:**
| Name | Component | Handles |
|------|-----------|---------|
| `wfwListDetails` | ListDetailsComponent | `list-detail` |
| `wfwCarousel` | CarouselComponent | `carousel` |

## Dependencies

- `dc-workflow` - Base workflow infrastructure
- `xt-components` - Core component infrastructure
- `xt-plugin-default` - CarouselObjectSetComponent
- `primeng` - UI components (tabs, toolbar, button, dialog, progressspinner)

## Development

```bash
# Build the plugin
ng build workflow

# Run tests
ng test workflow
```
