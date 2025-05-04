/**
 * The global type registry Mgr
 */
import { XtTypeHierarchyResolver, XtUpdatableTypeResolver } from './resolver/xt-type-resolver';

declare global {
  var XT_TYPE_MGR: XtUpdatableTypeResolver;
}

export function initXtType () {
  if (globalThis.XT_TYPE_MGR==null) {
    globalThis.XT_TYPE_MGR = new XtTypeHierarchyResolver();
    //console.debug("Global type manager is ", globalThis.XT_TYPE_MGR);
  }
}

export function xtTypeManager (): XtUpdatableTypeResolver {
  if (globalThis.XT_TYPE_MGR==null) {
    initXtType();
  }
  return globalThis.XT_TYPE_MGR;
}

// run the init by default
//initXtType();