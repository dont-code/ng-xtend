![ng-xtend logo](https://dont-code.net/assets/images/logos/logo-xtend-angular-red-small.png)

## ng-xtend, what for ?

The most successfull web applications have developed an eco-systems around them. Check Nextcloud, Drupal, Joomla! or Wordpress, it's so easy to add a plugin that meets your needs.

The technology they are using, PHP, makes it easy to develop and install new plugins. With additional efforts, these plugins are automatically installed, recognized and available.

While I love the way Angular & Typescript work, there is no easy way to provide extension capabilities through plugins developed by external teams.

That's why I am developing ng-xtend !

## What is ng-xtend concretely ?

It's an Angular library allowing you to:
- Dynamically select and display the right components into your Angular pages, even in Form.
- Dynamically load and install plugins in your Angular application
- Easily develops Plugins that will be automatically recognized and used at the right time and the right place.

## What kind of plugins will be supported

3 types of plugins will be supported as a first step
- Simple Component: With limited effort and intrusion in your code, you can transform a regular Angular component into a pluggable one. Ideal for providing view or display of a custom type.
- Complex Component: With some additional effort, this type Angular Component can itself provide xtend-points, filled by ng-xtend with the right plugin. Ideal for displaying complex information, where you want to delegate actions or display.
For example, think of a "Money" plugin that delegates the "Currency" management to another plugin, without even knowing it.
- Action Components: Provides actionable services on types without User Interface elements.

Then, we can think of more advanced components, like
- Workflow component: Enable pre-defined flow of pages (list to detail for example...) 

## How will it work ?

As you can infer from the preceding descriptions, the ng-xtend framework heavily relies on types. Any data manipulated in a ng-xtendable application manipulates data with a type.

With the type, ng-xtend selects the right plugin and invokes it. As mentioned, a plugin can be used to display or edit a certain type in the UI, or provides possible actions to the type. The actions will be displayed as buttons the user can click.

Upon loading, the plugin registers itself to ng-xtend and provides the list of types and actions it supports.

Whenever encountering a certain type, ng-xtend will look for the right plugin, select the right component, and call it with the proper context. This happens without the host knowing the plugin.

The host only provides xtend-points in their application, like "here you can display buttons of all actions of this 'type'", or "here I need the user to enter this 'type', please find the right plugin".

As well, plugins will be able to alter the application menus and some other customizations.

## What is the roadmap ?

- [x] Insertion of simple component dynamically 
- [x] Registry of plugins
- [x] Easier support for complex components
- [ ] Dynamic loading of plugins
- [ ] v1 !
- [ ] Enhanced component selection criteria (xt-type, context)
- [ ] Support for action components
- [ ] v2 !

## How to use it ?
This is still work in progress, so you will have to get your hands a little bit dirty!

1. Checkout this repository
2. It's a monorepo using [rush build system](https://rushjs.io/), so first run `npm install -g @microsoft/rush`, then `rush update`, and `rush build`
2. Use a copy of [libs/xt-plugin-sample](https://github.com/dont-code/ng-xtend/tree/main/libs/xt-plugin-sample) to develop your own plugins and components
3. Unit test your components using Jest / Karma
   1. ng-xtend provides pre-defined hosts for different cases (in a form or not) that will easily embed your component for testing
   2. See [currency simple component test](https://github.com/dont-code/ng-xtend/blob/main/libs/xt-plugin-sample/projects/sample/src/lib/currency/sample-currency.component.spec.ts)
   3. Or [money complex component test](https://github.com/dont-code/ng-xtend/blob/main/libs/xt-plugin-sample/projects/sample/src/lib/money/sample-money.component.spec.ts)
4. Test your components by
   1. Adding your plugin project to [xt-plugin-tester/package.json](https://github.com/dont-code/ng-xtend/blob/main/libs/xt-plugin-tester/package.json)
   2. Register your plugin in [xt-plugin-tester App Component](https://github.com/dont-code/ng-xtend/blob/main/libs/xt-plugin-tester/projects/plugin-tester/src/app/app.component.ts)
   3. Run the xt-plugin-tester with `ng serve plugin-tester` in xt-plugin-tester directory
   4. Select your component in the screen, and play with it
5. Use your component in your own Angular Application
   1. Include the xt-components library in your package.json
   2. Include your plugin library in your package.json
   3. Sets insertion point in your angular pages
      1. Either with `<xt-render [componentType]="YourComponentClass" [displayMode]="'FULL_VIEW' or 'INLINE_VIEW'" [value]="The value to display" ></xt-render>` if you already know the Component to use
      2. Or in a form `<xt-render [componentType]="YourComponentClass" [displayMode]="'FULL_EDITABLE'" [formGroup]="The FormGroup" [subName]="Component name in the form" ></xt-render>`
      3. If you don't know the component in advance, you can just set the value type, like this: `<xt-render [valueType]="A string with a register type name" [displayMode]="'FULL_VIEW' or 'INLINE_VIEW'" [value]="The value to display" ></xt-render>`, and ng-xtend will find the best component
      4. To support more complex scenario, use `<xt-render-sub [context]="context()"></xt-render-sub>` with `context ()` returning type information necessary to select the right component.

## Thank you
