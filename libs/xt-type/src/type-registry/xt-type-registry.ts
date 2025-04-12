import { ManagedData } from '../managed-data/managed-data';
import { XtTypeDefinition } from '../definitions/xt-type-definition';
import { XtTypeHandler } from '../definitions/xt-type-handler';
import { DefaultTypeHandler } from '../handlers/default-type-handler';
import { TSchema, Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

export class XtTypeRegistry<TD extends TSchema=TSchema> {
  protected typeMap= new Map<string,XtTypeDefinition<TD>>();
  protected handlers=new Set<XtTypeHandler<TD>>();
  protected definitionsMap = new Map<TD, XtTypeDefinition<TD>>();

  addType (typeName:string, typeDescription:TD, typeHandler?:XtTypeHandler<TD>) {
    const handler = typeHandler??new DefaultTypeHandler<TD>(typeDescription);
    this.handlers.add(handler);
    const typeDefinition={typeName, definition:typeDescription, handler:handler};
    this.typeMap.set(typeName, typeDefinition);
    this.definitionsMap.set(typeDescription, typeDefinition);
  }

  addTypeDefinition (typeName:string, typeDefinition:XtTypeDefinition<TD>) {
    if (typeDefinition.handler==null) {
      typeDefinition.handler=new DefaultTypeHandler<TD>(typeDefinition.definition);
    }
    this.typeMap.set(typeName, typeDefinition);
    this.handlers.add(typeDefinition.handler);
    this.definitionsMap.set(typeDefinition.definition, typeDefinition);

  }

  getType (typeName:string):XtTypeDefinition<TD>|undefined {
    return this.typeMap.get(typeName);
  }

  /**
   * This method tries to find the type of the value in parameter.
   * @param value
   * @param type Allow to call the function even if you already know the type: It will just return it
   * @param dynamic If no handlers support it, do we create a new Type dynamically ?
   */
  inferType (value:ManagedData|null|undefined, type?:XtTypeDefinition<TD>): XtTypeDefinition<TD> | undefined {
    if (type!=null) {
      return type;
    } else if( value == null) {
      return;
    } else {
      let def=null;
      // Search for in all register handlers
      for (const handler of this.handlers) {
        def = handler.isHandling(value);
        if (def!=null) { return this.definitionsMap.get(def); }
      }
    }
  }

  listSubTypes (type?:XtTypeDefinition<TD>,value?:ManagedData):XtTypeDefinition<TD>[]{
    return [];
  }
}

export function getXtTypeRegistry (): XtTypeRegistry<any> {
  return XT_TYPE_GLOBAL_REGISTRY;
}

const XT_TYPE_GLOBAL_REGISTRY = new XtTypeRegistry<any>();
