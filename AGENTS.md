# Notes for AI agents

## Build dependencies
- When changing source in **any plugin or library**, you **must rebuild** it before the changes are picked up by dependent projects.
  ```
  cd plugins/xt-default && npx ng build default
  cd plugins/xt-web    && npx ng build web
  cd libs/xt-components && npx ng build xt-components
  ```
  The build output is linked into downstream `node_modules/` via symlinks (e.g. `plugins/xt-workflow/node_modules/xt-plugin-default -> ../../xt-default/dist/xt-plugin-default`). The test runner resolves the dependency from the built output, not the source.
