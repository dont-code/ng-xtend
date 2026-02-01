![ng-xtend logo](https://dont-code.net/assets/images/logos/logo-xtend-angular-red-small.png)
# DC-Workflow

Adds workflow functionalities to xt-components.
Links together components, stores into a coherent user journey, allowing plugins to override default workflows

By default, supports list-detail and carousel workflows, with the possibility to configure sorting & selection method.

## Building

To build the library, run:

```bash
ng build dc-workflow
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory:
   ```bash
   cd dist/dc-workflow
   ```

2. Run the `npm publish` command to publish your library to the npm registry:
   ```bash
   npm publish
   ```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
