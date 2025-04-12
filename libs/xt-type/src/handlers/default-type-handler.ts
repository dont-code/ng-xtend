import { XtTypeHandler } from '../definitions/xt-type-handler';
import { ManagedData } from '../managed-data/managed-data';
import { Value } from '@sinclair/typebox/value';
import { TObject, TProperties, TSchema, TypeGuard } from '@sinclair/typebox';

/**
 * A DefaultTypeHandler using typebox as underlying type system. Supports only one definition
 */
export class DefaultTypeHandler<TD extends TSchema = TSchema> implements XtTypeHandler<TD> {
  definition: TD;

  constructor(definition: TD) {
    this.definition = definition;
  }

  fromJson(json: string): ManagedData {
    return Value.Decode(this.definition, json);
  }

  isHandling(value: ManagedData): TD|null {
    if (Value.Check(this.definition, value))
      return this.definition;
    else
      return null;
  }

  newValue(): ManagedData {
    return Value.Create(this.definition) as ManagedData;
  }

  subTypeNames(): string[] {
    if (TypeGuard.IsObject(this.definition)) {
      const objectDef=this.definition as TObject<TProperties>;
      return Object.keys(objectDef.properties);
    }
    return [];
  }

  toJson(value: ManagedData): string {
    return Value.Encode(this.definition, value);
  }

}