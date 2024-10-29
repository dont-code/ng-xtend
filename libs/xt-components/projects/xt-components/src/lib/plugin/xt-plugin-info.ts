export type XtComponentInfo<T> = {
    componentName: string;
    componentClass: T;
    typesHandled: string[];

}

export type XtPluginInfo ={
    name: string;
    components?: XtComponentInfo<any>[];
    types?: XtTypeInfo[];
}

export type XtTypeInfo = {
    __type:string;
    [keys: string]: XtTypeInfo|string;
}