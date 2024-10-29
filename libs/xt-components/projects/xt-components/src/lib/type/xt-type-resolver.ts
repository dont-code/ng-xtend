import { XtTypeInfo } from "../plugin/xt-plugin-info";

/**
 * Determines the type of elements based on a hierarchy of type
 */
export type XtTypeResolver<TypeContext> = {

    findType (typeInfo:TypeContext, subName?:string, value?:any):any|undefined;

    canUpdate (): boolean;
}

export type XtUpdatableTypeResolver<TypeContext> = XtTypeResolver<TypeContext> & {
    addType (typeInfo:TypeContext, type:XtTypeInfo):void;

}

export class XtTypeHierarchyResolver implements XtUpdatableTypeResolver<string> {
    types= new Map<string, XtTypeHierarchy> ();

    addType (typeInfo:string, type:XtTypeInfo):void {
        this.types.set (typeInfo, fromDescription (type));
    }

    canUpdate(): boolean {
        return true;
    }

    findType(typeInfo: string | null | undefined, subName?: string, value?: any):string | null | undefined {
        if( typeInfo==null)
            return typeInfo;
        if (subName==null) {
            return typeInfo;
        } else {
            const selectedType = this.types.get(typeInfo);
            if( (selectedType != null) && (selectedType.children!=null)) {
                return selectedType.children[subName].type;
            }
        }

        return undefined;
    }


}

export type XtTypeHierarchy = {
    type:string;
    children?:{[key:string]: XtTypeHierarchy} ;
    parent?:XtTypeHierarchy;

    addChild (key:string, child:XtTypeHierarchy) : void;
}

export class XtBaseTypeHierarchy implements XtTypeHierarchy {
    type:string;
    children?:{[key:string]: XtTypeHierarchy} ;
    parent?:XtTypeHierarchy;

    constructor (type:string) {
        this.type=type;
    }

    addChild (key:string, child:XtTypeHierarchy) : void {
        if (this.children==null) this.children= {};
        this.children[key]=child;
    }

}

export function fromDescription (typeHierarchy:XtTypeInfo): XtTypeHierarchy {
    const ret: XtBaseTypeHierarchy=new XtBaseTypeHierarchy(typeHierarchy.__type);

    for (const key of Object.keys(typeHierarchy)) {
        const value = typeHierarchy[key];
        if (key!=='__type') {
            if ( typeof value === 'string') {
                // It's a type
                ret.addChild(key, new XtBaseTypeHierarchy (value));
            }
            else if (value.__type!=null){
                ret.addChild(key, fromDescription (value as XtTypeInfo));
            } else {
                throw new Error ("Cannot read type "+ value);
            }
        }
    }
    return ret;
}

