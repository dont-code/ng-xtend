import { XtTypeInfo } from 'xt-type';
import { XtOutputType } from '../xt-component';
import { XtActionHandler } from '../action/xt-action-handler';

export type XtComponentInfo<T> = {
    componentName: string;
    componentClass: T;
    typesHandled: string[];
    outputs?: XtOutputType[]
}

export type XtTypeHandlerInfo<T> = {
  typesHandled: string[];
  handlerClass: T;
}

export type XtActionInfo<T> = {
  description: string,
  visible: boolean,
  handlerClass: any,
  iconUrl?: string
}

export type XtActionHandlerInfo<T> = {
  types: string[];
  actions: {
    [name: string]: XtActionInfo<T>;
  }
}

export type XtPluginInfo ={
    name: string;
    uriLogo?: string;
    components?: XtComponentInfo<any>[];
    types?: XtTypeInfo;
    typeHandlers?: XtTypeHandlerInfo<any>[];
    actionHandlers?: XtActionHandlerInfo<any>[];
}
