import { XtTypeInfo } from 'xt-type';
import { XtOutputType } from '../xt-component';
import { XtActionHandler } from '../action/xt-action-handler';
import { XtWorkflow } from '../workflow/xt-workflow';

/** Information about a registered component plugin */
export type XtComponentInfo<T> = {
    componentName: string;
    componentClass: T;
    typesHandled: string[];
    outputs?: XtOutputType[]
}

/** Information about a registered workflow plugin */
export type XtWorkflowInfo<T extends XtWorkflow> = {
  name: string;
  class: T;
  workflowsHandled: string[];
}

/** Information about a registered type handler plugin */
export type XtTypeHandlerInfo<T> = {
  typesHandled: string[];
  handlerClass: T;
}

/** Information about a registered action */
export type XtActionInfo<T> = {
  description: string,
  visible: boolean,
  handlerClass: any,
  iconUrl?: string
}

/** Information about a registered action handler that groups actions by type */
export type XtActionHandlerInfo<T> = {
  types: string[];
  actions: {
    [name: string]: XtActionInfo<T>;
  }
}

/** Information about a registered plugin containing components, workflows, types, and action handlers */
export type XtPluginInfo ={
    name: string;
    uriLogo?: string;
    components?: XtComponentInfo<any>[];
    workflows?: XtWorkflowInfo<any>[];
    types?: XtTypeInfo;
    typeHandlers?: XtTypeHandlerInfo<any>[];
    actionHandlers?: XtActionHandlerInfo<any>[];
}
