<center>
# ![ng-xtend logo](https://dont-code.net/assets/images/logos/logo-xtend-angular-red-small.png) Ng-xtend Framework 
Enable plugins in your Angular application ! 
</center>



## ng-xtend, what for?

The most successful web applications enjoy an eco-system of plugins with them. Check Nextcloud, Drupal, Joomla! or Wordpress, it's so easy to extend them with a plugin that meets your needs.

The technology they are using, PHP, makes it easy to develop and install new plugins. With limited efforts, these plugins are automatically installed, recognized and available.

While I love the way Angular & Typescript work, there is no easy way to provide extension capabilities through plugins developed by external teams.

That's why I have developed ng-xtend !

## What is ng-xtend concretely?

It's an Angular library allowing you to:
- Define in a simple way the data you want to process in your application.
- Use plugins together to render or edit this data.
- Dynamically load and install plugins.
- Save / Load / Update the data to any storage.

## Some examples ?
Here are screenshots of an application automatically handling list, view and edition of complex data (evaluations of coffee beans) using ng-xtend, a [dont-code application](https://dont-code.net/){target="_blank"}, and the [default plugin](https://github.com/dont-code/ng-xtend/tree/main/plugins/xt-default) and [web plugin](https://github.com/dont-code/ng-xtend/tree/main/plugins/xt-web)  
You can see how the different plugins work together without knowing each other. Even the host application does not know them.

![List view screenshot](https://dont-code.net/assets/images/screenshots/xt-host-list-view-split.png)
![Edit object screenshot](https://dont-code.net/assets/images/screenshots/xt-host-edit-view-split.png)

Curious ? You can run and test the application here: [Coffee Bean Evaluation](https://test.dont-code.net/apps/latest/xt-host/?project=Coffee%20Beans%20Evaluation){target="_blank"}

## What kind of plugins are supported ?

3 types of plugins are supported as a first step
- Simple Components: With limited effort and intrusion in your code, you can transform a regular Angular component into a pluggable one. Ideal for providing view or display of a custom type.
- Complex Components: With some additional effort, this type Angular Component can itself provide extension points, filled by ng-xtend with the right plugin. Ideal for displaying complex information, where you want to delegate actions or display.
For example, think of a "Money" plugin that delegates the "Currency" management to another plugin, without even knowing it.
- List Components: Displays a list of any objects. It calls other plugins to manage the values inside the displayed list

Then in the future, we'll support
- Action Components: Provides actionable services on types without User Interface elements.
- Workflow components: Enable pre-defined flow of pages (list to detail for example...) 

## How does it work ?

As you can infer from the preceding descriptions, the ng-xtend framework heavily relies on types. Any data manipulated in a ng-xtendable application manipulates data with a type.

As mentioned, a plugin can be used to display or edit a certain type in the UI, or to act on the type. The actions will be displayed as buttons the user can click.

The host application dynamically loads the plugins from remote locations. A [simple config file is enough](https://github.com/dont-code/ng-xtend/blob/main/apps/xt-host/projects/host/public/assets/config/default.json) to define what plugins to load from where.

Upon loading, the plugin registers itself to ng-xtend and provides the list of types and actions it supports.

Whenever encountering a certain type, ng-xtend will look for the right plugin, select the right component, and call it with the proper context. This happens without the host knowing the plugin.

The host only needs to provide xt-render points in their application, like "here you can display action buttons for this 'type'", or "here I need the user to enter this 'type', please find the right plugin".

As well, plugins will be able to alter the application menus and other customizations.

## What is the roadmap ?

- [x] Insertion of simple component dynamically 
- [x] Registry of plugins
- [x] General support for complex components and lists
- [x] Strong type support
- [x] Dynamic loading of plugins
- [ ] v1 !
- [ ] Enhanced component selection criteria (xt-type, context)
- [ ] Support for action components
- [ ] v2 !

## How to use it ?
This is still work in progress, but now it can support [real-life applications](https://test.dont-code.net/apps/latest/xt-host/?project=Coffee%20Beans%20Evaluation){target="_blank"} !

### Developing a new plugin
1. Checkout the repository [ng-xtend](https://github.com/dont-code/ng-xtend){target="_blank"}
2. It's a monorepo using [rush build system](https://rushjs.io/), so run

```bash
    npm install -g @microsoft/rush
    rush update
    rush build
```

3. Use a copy of [libs/xt-plugin-sample](https://github.com/dont-code/ng-xtend/tree/main/libs/xt-plugin-sample) to develop your own plugins and components.
3. Unit test your components using vitest
   1. ng-xtend provides pre-defined test pages for different cases (in a form or not) that will easily embed your component for testing
   2. See [currency simple component test](https://github.com/dont-code/ng-xtend/blob/main/libs/xt-plugin-sample/projects/sample/src/lib/currency/sample-currency.component.spec.ts){target="_blank"}
   3. Or [money complex component test](https://github.com/dont-code/ng-xtend/blob/main/libs/xt-plugin-sample/projects/sample/src/lib/money/sample-money.component.spec.ts){target="_blank"}
4. Test your components using plugin-tester
   4. Run your plugin tester application, for example `ng serve sample-tester` for the sample plugin
   5. Run the xt-plugin-tester with `ng serve plugin-tester` in xt-plugin-tester directory
   5. In the Plugin Tester app, load your plugin by entering its url (http://localhost:4201 for sample plugin) in the Plugin url field.
   4. Once loaded, go to the test screen, select your component in the second screen, and play with it
   5. For easier debugging, you can statically add and register your plugin to [xt-plugin-tester/package.json](https://github.com/dont-code/ng-xtend/blob/main/apps/xt-plugin-tester/package.json){target="_blank"}

### Use plugins in my application
To use ng-xtend plugins in your own Angular Application, [xt-host project](https://github.com/dont-code/ng-xtend/tree/main/apps/xt-host){target="_blank"} is a great example.
It does:
  - Install xt-components and the default plugin in your package.json

```bash
    npm install xt-components
    npm install xt-plugin-default
```

  - Configure your application to load your plugins.

```javascript
    protected resolverService = inject (XtResolverService);
    this.resolverService.loadPlugin(url);
```

    The plugins will register themselves automatically.
  - Describe the data type you want to manipulate

```javascript
    this.resolverService.registerTypes ({
      money:{
        amount:'number',
      currency:'currency'  /** Type provided by the finance plugin **/ 
    },
      book: {
        name:'string',
        publication:'date',
        price:'money',
        notation:'rating'  /** Type provided by the web plugin **/
      }    
    }); 
```

  - Sets insertion point in your angular pages
    - For example, to display a table of books

```html
        <h1>List of books</h1>
        <xt-render [displayMode]="LIST_VIEW" [valueType]="book" [value]="listOfBooks" ></xt-render>
```
    
    - or allow editing a book information

```html
        <h1>Enter your book details</h1>
        <div form="bookForm">
          <xt-render [displayMode]="FULL_EDITABLE" [valueType]="book" [formGroup]="bookForm" subName="book"></xt-render>
        </div>
```
    - To support more complex scenario, use

```html
       <xt-render-sub [context]="context()"></xt-render-sub>
```

    with `context ()` returning type information necessary to select the right component.

## Thank you
