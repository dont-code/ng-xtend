# Notes for AI agents

## Build dependencies
- When changing source in **any plugin or library**, you **must rebuild** it before the changes are picked up by dependent projects.
  ```
  cd plugins/xt-default && npx ng build default
  cd plugins/xt-web    && npx ng build web
  cd libs/xt-components && npx ng build xt-components
  ```
  The build output is linked into downstream `node_modules/` via symlinks (e.g. `plugins/xt-workflow/node_modules/xt-plugin-default -> ../../xt-default/dist/xt-plugin-default`). The test runner resolves the dependency from the built output, not the source.

## Carousel and Workflow Architecture

### Component hierarchy

```
wfw-render (dc-workflow library)
  └─ resolves workflow component via WfwResolverService.findBestWorkflow(config)
       └─ CarouselComponent (xt-workflow plugin) or ListDetailsComponent
            └─ <lib-carousel-object-set> (xt-default plugin)
                 └─ <xt-render> per panel (xt-components library)
```

- `WfwRender` uses `ngComponentOutlet` with `<ng-container>` (no wrapper DOM elements).
- `CarouselComponent` extends `AbstractDcWorkflow<T>` which declares `config = input.required<DcWorkflowModel>()`.
- `CarouselObjectSetComponent` is the actual carousel UI with panels, navigation, and edit button.
- Each panel's content is rendered via `xt-render` in `FULL_VIEW` mode.

### Key files

| Purpose | Path |
|---------|------|
| Carousel object set template | `plugins/xt-default/projects/default/src/lib/object-set/carousel-object-set.component.html` |
| Carousel object set CSS | `plugins/xt-default/projects/default/src/lib/object-set/carousel-object-set.component.css` |
| Carousel workflow component | `plugins/xt-workflow/projects/workflow/src/lib/carousel/carousel.component.ts` |
| Carousel workflow template | `plugins/xt-workflow/projects/workflow/src/lib/carousel/carousel.component.html` |
| Carousel workflow CSS | `plugins/xt-workflow/projects/workflow/src/lib/carousel/carousel.component.css` |
| Workflow config model | `libs/dc-workflow/projects/dc-workflow/src/lib/models/dc-workflow-model.ts` |
| Abstract workflow base | `libs/dc-workflow/projects/dc-workflow/src/lib/abstract/abstract-dc-workflow.ts` |
| WfwRender component | `libs/dc-workflow/projects/dc-workflow/src/lib/render/wfw-render.ts` |
| XtRender component | `libs/xt-components/projects/xt-components/src/lib/render/xt-render.component.ts` |
| Test workflow page | `plugins/xt-workflow/projects/workflow-plugin/src/app/test-workflow/` |
| Test object-set page | `plugins/xt-default/projects/default-plugin/src/app/test-object-set/` |

### DcWorkflowModel

```typescript
type DcWorkflowModel = {
  entity: string,
  workflow: 'list-detail' | 'carousel',
  editButton?: boolean,       // optional, default true in CarouselComponent
  data?: { sort?: DcWorkflowSortModel },
  display?: DcWorkflowDisplayModel,
  selection?: DcWorkflowSelectionModel
}
```

### Edit dialog

- The edit dialog is rendered by `CarouselComponent` using PrimeNG `<p-dialog>`.
- It is always in the DOM (not `*ngIf`'d), controlled by `dialogVisible` signal.
- On desktop: dialog auto-sizes to content with `min-width: 50vw; max-width: 90vw`.
- On mobile (`max-width: 767px`): forced to `95vw` with scrollable content (`max-height: 70vh`).
- Uses `styleClass="carousel-edit-dialog"` for CSS targeting.
- Content is rendered via `<xt-render displayMode="FULL_EDITABLE">`.

### Carousel panel layout

- Horizontal: panels are `flex: 0 0 calc((100% - 2rem) / 3)` (3 visible).
- Portrait/vertical: panels are `flex: 0 0 calc(100% - 1rem); width: 100%` (stacked, 50vh viewport).
- Track is `display: flex; position: relative` (relative for exiting panel absolute positioning).
- Viewport has `overflow: hidden; flex: 1; min-width: 0`.
- Edit button (pencil icon) appears on the selected panel when `editButton()` is true.

### Rendering context caveat

- `wfw-render` and `xt-render` both have empty CSS (inline by default, no `:host` styles).
- In `test-object-set`, the carousel is wrapped in `<div class="list_view_container">` (block, padding: 4rem) which constrains width.
- In `test-workflow`, the carousel is placed directly in the template. A flex div wrapper may be needed in front of `<wfw-render>` to prevent layout issues (carousel items overlapping).

### Build order for carousel/workflow changes

```
cd libs/dc-workflow     && npx ng build dc-workflow     # if DcWorkflowModel changed
cd plugins/xt-default   && npx ng build default          # if carousel-object-set changed
cd plugins/xt-workflow   && npx ng build workflow          # if CarouselComponent changed
```
