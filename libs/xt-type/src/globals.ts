/**
 * The global type registry Mgr
 */
import { XtTypeHierarchyResolver, XtUpdatableTypeResolver } from './resolver/xt-type-resolver';

declare global {
  var XT_TYPE_MGR: XtUpdatableTypeResolver;
}

/**
 * Initializes the global type manager if it does not already exist
 */
export function initXtType () {
  if (globalThis.XT_TYPE_MGR==null) {
    globalThis.XT_TYPE_MGR = new XtTypeHierarchyResolver();
    //console.debug("Global type manager is ", globalThis.XT_TYPE_MGR);
  }
}

/**
 * Returns the global type manager instance, initializing it if necessary
 * @returns The global XtUpdatableTypeResolver instance
 */
export function xtTypeManager (): XtUpdatableTypeResolver {
  if (globalThis.XT_TYPE_MGR==null) {
    initXtType();
  }
  return globalThis.XT_TYPE_MGR;
}

// run the init by default
//initXtType();