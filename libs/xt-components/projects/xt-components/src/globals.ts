/**
 * The global plugin registry.
 * Plugins will register to this when loaded.
 */
import { XtPluginRegistry } from './lib/registry/xt-plugin-registry';

declare global {

  var  XT_REGISTRY:XtPluginRegistry;
}

export function initXtPluginRegistry () {
  if (globalThis.XT_REGISTRY==null) {
    globalThis.XT_REGISTRY = new XtPluginRegistry();
  }
}

export function xtPluginRegistry (): XtPluginRegistry {
  if (globalThis.XT_REGISTRY==null) {
    initXtPluginRegistry();
  }
  return globalThis.XT_REGISTRY;
}
