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
export class SampleWorkflowComponent extends SimpleWorkflow {}
```

`SimpleWorkflow` (from `dc-workflow`) already declares the required `config` input, so a
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

## Create a new workflow in 3 steps

1. **Create the component.** Copy `sample-workflow.component.ts` and change the template:

   ```typescript
   @Component({
     selector: 'wfw-my-workflow',
     imports: [],
     template: `<p>My brand new workflow</p>`,
   })
   export class MyWorkflowComponent extends SimpleWorkflow {}
   ```

2. **Register it.** Copy `register.ts` and give your workflow a unique name and type:

   ```typescript
   resolverService.registerPlugin({
     name: 'myWorkflowPlugin',
     workflows: [
       { name: 'myWorkflow', class: MyWorkflowComponent, workflowsHandled: ['my-type'] },
     ],
   });
   ```

3. **Use it.** Set `workflow: 'my-type'` in your `DcWorkflowModel`; `wfw-render` finds it
   automatically.

> **Need data?** Extend `AbstractDcWorkflow` instead of `SimpleWorkflow`. It adds store
> management (`fetchFromStore`, `storeEntity`, `deleteEntity`, ...) used by the built-in
> `list-detail` and `carousel` workflows in `xt-plugin-workflow`.

## Project layout

```
projects/
  workflow-sample/          # the library published as xt-workflow-sample
    src/lib/
      sample-workflow.component.ts   # the workflow itself
      register.ts                    # plugin registration
  workflow-sample-plugin/   # a small app used to run and test the workflow
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
  './SampleWorkflowComponent': './projects/workflow-sample/src/lib/sample-workflow.component.ts',
  './Register': './projects/workflow-sample/src/lib/register.ts'
}
```

When cloning this sample into a new workflow plugin, update `name` and the `exposes` paths
to match your component and register files.

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

- `dc-workflow` - Workflow infrastructure (`SimpleWorkflow`, `AbstractDcWorkflow`, `DcWorkflowModel`, `WfwRender`)
- `xt-components` - Core component infrastructure (`XtResolverService`)
- `primeng` - UI components used by the demo app
