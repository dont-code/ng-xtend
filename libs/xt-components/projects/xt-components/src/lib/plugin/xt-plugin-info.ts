export type XtComponentInfo<T> = {
    componentName: string;
    componentClass: T;
    typesHandled: string[];

}

export type XtPluginInfo ={
    name: string;
    components?: XtComponentInfo<any>[];
    types?: XtTypeInfo;
}

export type XtTypeInfo = {
    [keys: string]: XtTypeInfo|string;
}
