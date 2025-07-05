![ng-xtend logo](../../docs/logos/logo-xtend-angular-red-small.png)

# Plugin Tester

This project allows you to load and test in live your developed components for the [ng-xtend framework](https://github.com/dont-code/ng-xtend/blob/main/README.md)

Test your components by
1. Building the xt-components framework
```bash
    npm install -g @microsoft/rush
    rush update
    rush build
```
4. Starting your plugin, for example, the web-plugin
```bash
  cd ../plugins/xt-web
  ng serve web-tester
```
3. Then running the xt-plugin-tester with `ng serve plugin-tester`

![initial screen](docs/screenshots/initial-plugin.png)

6. Typing the plugin url in the url bar:

![web-plugin url](docs/screenshots/typing-web-plugin-url.png)

7. Then pressing load button will execute the plugin

![loading plugin](docs/screenshots/web-plugin-detail.png)

8. Go to the test page, and selects your component to test

![select rating](docs/screenshots/select-rating.png)

9. the component is then run in editing and viewing mode, allowing you to test!

![Test rating](docs/screenshots/edit-rating.png)


