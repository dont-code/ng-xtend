Hey, let me introduce you to [ng-xtend](https://ng-xtend.dev), the open-source plugin framework for Angular!

Notice how Wordpress, Nextcloud or Drupal are successful thanks to their ecosystem of plugins?
Notice how easy it is to develop, discover and install them?

*Wouldn't it be great to have the same extensibility for Angular apps?*

That's what **ng-xtend** is for !

With it, your application can
- Statically or dynamically loads plugins
- Assign a plugin to display, edit or act on a particular data type
- Have all plugins work together in a page, a list, a form or for data persistence

Today with release 0.6, with a simple json file like this:

```
{
  "type": "Application",
  "name": "Coffee Bean Evaluator",
  "entities": {
    "a": {
      "name": "Coffee Evaluation",
      "fields": {
        "e": {
          "name": "Name",
          "type": "Text"
        },
        "b": {
          "name": "Picture",
          "type": "Image"
        },
        "c": {
          "name": "Comment",
          "type": "Text"
        },
        "d": {
          "name": "Note",
          "type": "Rating"
        },
        "a": {
          "name": "Maxicoffee",
          "type": "Price"
        }
      }
    }
}
```

You instantly get this: *(click to see the real application)*
[![Coffee Beans Evaluation](https://ng-xtend.dev/docs/screenshots/xt-host-list-view-plugins.png)](https://test.dont-code.net/apps/latest/host/?repository=default&project=Coffee%20Beans%20Evaluation)

Other examples here:[Demo Repository](https://dont-code.net/apps/repo/default)

You can check [ng-xtend-examples repo](https://github.com/dont-code/ng-xtend-examples) to learn how to use [ng-xtend](https://github.com/dont-code/ng-xtend).

Developing a new plugin is basically just wrapping existing angular components into a lightweight framework, you can check here for an example.

The framework is growing in several directions:
- Obviously enhance the UI/UX of the default plugin. It works but would really need to be more user friendly.
- Extend support of any kind of datamodels, like "list of sub elements" or "many-to-one", "many-to-many relationship"
- Look at how a non-IT user could leverage AI and LLM to generate their application. As it just needs a json file, it should be feasible
- Have more and more plugins by making them easy to develop and to consume
- Add support for advanced workflows, in addition to the master-detail provided.
