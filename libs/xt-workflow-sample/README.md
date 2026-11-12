![ng-xtend logo](https://dont-code.net/assets/images/logos/logo-xtend-angular-red-small.png)

# XT-Workflow-Sample

This is a workflow plugin for the [ng-xtend framework](https://github.com/dont-code/ng-xtend/blob/main/README.md).

It is the smallest possible workflow: it only displays **"I'm the Sample Workflow"**.
It exists to show how little code is needed to plug a new workflow into ng-xtend, and to
serve as a copy-paste starting point.

## The plugin

| Name | Component | Handles |
|------|-----------|---------|
| `wfwSample` | `SampleWorkflowComponent` | `sample` |

The whole component is:

```typescript
@Component({
  selector: 'wfw-sample-workflow',
  imports: [],
  template: `<p>I'm the Sample Workflow</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SampleWorkflowComponent extends AbstractDcWorkflowBase {}
```

`AbstractDcWorkflowBase` (from `dc-workflow`) already declares the required `config` input, so a
workflow with no data access is just a template.

## Register it

```typescript
import { registerWorkflowSamplePlugin } from 'xt-workflow-sample';

registerWorkflowSamplePlugin(resolverService);
```

Then ask `wfw-render` for the `'sample'` workflow type:

```typescript
const config: DcWorkflowModel = { entity: 'anything', workflow: 'sample' };
```

```html
<wfw-render [workflowConfig]="config" />
```

## Turn the sample into your own workflow

Every sample-specific name in this package is built from a **single placeholder word,
`sample`**, used in three case forms. Renaming the sample into a new workflow is therefore
just a find/replace of those three strings — there is no other name to hunt down.

| Find (case-sensitive) | Replace with | Example for a workflow named `invoice` |
|-----------------------|--------------|----------------------------------------|
| `sample`              | `<name>`     | `invoice`                              |
| `Sample`              | `<Name>`     | `Invoice`                              |
| `SAMPLE`              | `<NAME>`     | `INVOICE`                              |

That one replacement keeps everything consistent, including:

- the npm package name (`xt-workflow-sample`),
- the Angular project names (`workflow-sample`, `workflow-sample-plugin`),
- the native-federation remote name and the `dist/` output folder,
- the workflow type (`'sample'`), the selector (`wfw-sample-workflow`), the component
  (`SampleWorkflowComponent`), the registration function (`registerWorkflowSamplePlugin`)
  and the constant (`SAMPLE_WORKFLOW_TYPE`),
- the demo app's title and heading texts.

### Steps

1. **Copy the package** to its new folder — the folder follows the same rule, e.g.
   `libs/xt-workflow-invoice`.
2. **Apply the three replacements** above to every file in the new folder.
3. **Rename the two component files** so their names match the new component name:
   - `projects/lib/src/lib/sample-workflow.component.ts`
   - `projects/lib/src/lib/sample-workflow.component.spec.ts`

   The `import` statements inside them are already updated by step 2.
4. **Register the new package** in the monorepo (all three use the same rule):
   - `rush.json`
   - `release-please-config.json`
   - `.release-please-manifest.json`
5. **Edit the template** in `projects/lib/src/lib/<name>-workflow.component.ts` to render
   your workflow instead of `I'm the Sample Workflow`.

### What you do *not* rename

- the project folders `projects/lib` and `projects/plugin` — already generic;
- the federation expose key `./Register` and the `registerPlugin` alias;
- the `wfw-` selector prefix and the `AbstractDcWorkflowBase` base class.

> **Need data?** Extend `AbstractDcWorkflow` instead of `AbstractDcWorkflowBase`. It adds store
> management (`fetchFromStore`, `storeEntity`, `deleteEntity`, ...) used by the built-in
> `list-detail` and `carousel` workflows in `xt-plugin-workflow`.

## Project layout

```
projects/
  lib/                      # the library published as xt-workflow-sample
    src/lib/
      sample-workflow.component.ts   # the workflow itself
      register.ts                    # plugin registration
  plugin/                   # a small app used to run and test the workflow
    federation.config.js             # native-federation config
    src/bootstrap.ts                 # Angular bootstrap
    src/main.ts                      # federation entry point
```

## Federation

The demo app is a [native-federation](https://www.npmjs.com/package/@angular-architects/native-federation)
remote named `workflow-sample-plugin`. Its `federation.config.js` exposes the workflow and
its registration function:

```js
exposes: {
  './SampleWorkflowComponent': './projects/lib/src/lib/sample-workflow.component.ts',
  './Register': './projects/lib/src/lib/register.ts'
}
```

Both the remote `name` and the `exposes` paths are updated automatically by the placeholder
replacement described in [Turn the sample into your own workflow](#turn-the-sample-into-your-own-workflow).

## Development

```bash
# Build the library
npm run build

# Build the federated demo app
npx ng build workflow-sample-plugin

# Run the library and app tests
npm run test

# Serve the demo app
npm start
```

## Dependencies

- `dc-workflow` - Workflow infrastructure (`AbstractDcWorkflowBase`, `AbstractDcWorkflow`, `DcWorkflowModel`, `WfwRender`)
- `xt-components` - Core component infrastructure (`XtResolverService`)
- `primeng` - UI components used by the demo app
