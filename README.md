![image](https://dont-code.net/assets/logo-shadow-squared.png)
## ng-xtend, what for ?

The most successfull web applications have developed an eco-systems around them. Check Nextcloud, Drupal, Joomla! or Wordpress, it's so easy to add a plugin that meets your needs.

The technology they are using, PHP, makes it easy to develop and install new plugins. With additional efforts, these plugins are automatically installed, recognized and available.

While I love the way Angular & Typescript work, there is no easy way to provide extension capabilities through plugins developed by external teams.

That's why I am developing ng-xtend !

## What is ng-xtend concretely ?

It's an Angular library allowing you to:
- Easily hosts plugins into your Angular components or pages at pre-defined xtend-points.
- Dynamically load and install plugins in your Angular application
- Easily develops Plugins that will be automatically recognized and use at the right time and the right place.

## What kind of plugins is supported

3 types of plugins will be supported as a first step
- Simple Component: With limited effort and intrusion in your code, you can transform a regular Angular component into a pluggable one. Ideal for providing view or display of a custom type.
- Complex Component: With some additional effortt, this type Angular Component can itself provide xtend-points, filled by ng-xtend with the right plugin. Ideal for displaying complex information, where you want to delegate actions or display.
For example, think of a "Money" plugin that delegates the "Currency" management to another plugin, without even knowing it.
- Action Components: Provides actionable services on types without User Interface elements.

## How is it working ?

As you can infer from the preceding descriptions, the ng-xtend framework heavily relies on types. Any data manipulated in a ng-xtendable application manipulates data with a type.

A plugin can add additional types, however to keep compatiblity the most used ones are defined in this list.
Whenever encountering a certain type, ng-xtend will look for the right plugin depending on the context, and call it. This happens without the host knowing the plugin.

The host only provides xtend-points in their application, like "here you can display buttons of all actions of this 'type'", or "here I need the user to enter this 'type', please find the right plugin".

As well, plugins can alter the application menus and some other customizations.

## Thank you
