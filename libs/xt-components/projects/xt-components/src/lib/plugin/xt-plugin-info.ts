import { XtTypeInfo } from 'xt-type';
import { XtOutputType } from '../xt-component';

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

export type XtPluginInfo ={
    name: string;
    uriLogo?: string;
    components?: XtComponentInfo<any>[];
    types?: XtTypeInfo;
    typeHandlers?: XtTypeHandlerInfo<any>[];
}
