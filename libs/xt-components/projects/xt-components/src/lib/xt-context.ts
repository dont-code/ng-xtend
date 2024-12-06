import { FormGroup } from "@angular/forms"
import { XtTypeResolver } from "./type/xt-type-resolver";
import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { single } from 'rxjs';

export type XtContext<T> = {

    displayMode: XtDisplayMode;

    subName?: string; // The subName in the parentFormGroup and parentContext
    parentFormGroup?: FormGroup;
    localFormGroup?: FormGroup;

    isInForm (): boolean;

    formGroup () : FormGroup | undefined;

    formControlNameOrNull():string|null;

    formControlValue (): any | null;

    subValue (subName?:string):T | null | undefined;

    subContext(subName: string | undefined | null, typeResolver?: XtTypeResolver<XtContext<T>>): XtContext<T>;

    displayValue: Signal<T|null>;

    value(): T | null | undefined;

    valueType?:string;

    toString (): string;
}

export type XtDisplayMode = 'INLINE_VIEW'|'FULL_VIEW'|'FULL_EDITABLE';

export class XtBaseContext<T> implements XtContext<T>{
    displayMode: XtDisplayMode = 'FULL_VIEW';

    /**
     * When editable, the value is stored in a parent formGroup
     */
    subName?: string;
    parentFormGroup?: FormGroup<any>;
  /**
   * localFormGroup exists only for composite components, simple components are only managing the subName'd ccontrol of the parentFormGroup
   */
    localFormGroup?: FormGroup<any>;

    /**
     * When not managed by a form, the value is here
     */
    nonFormValue?: WritableSignal<T|null>;

    valueType?:string;

    /**
     *
     * @param displayMode
     * @param readOnly
     * @param parentGroup
     * @param controlName
     */

    constructor (displayMode: XtDisplayMode, subName?: string, parentGroup?: FormGroup )
    {
        this.displayMode=displayMode;
        this.parentFormGroup=parentGroup;
        this.subName=subName;
    }

    setDisplayValue (newValue:T|null|undefined, type?:string): XtBaseContext<T> {
      if (newValue!=undefined){
        if (this.nonFormValue==null) {
          this.nonFormValue=signal(newValue);
        }else {
          this.nonFormValue.set(newValue);
        }
      }

      if (type!=undefined)
        this.valueType = type;
      return this;
    }

    displayValue = computed( ()=>  {
      if (this.nonFormValue!=null) {
        return this.nonFormValue();
      } else {
        throw new Error ("Cannot display a value that does not exist. Are you sure you're not using Reactive Form with this context? "+ this.toString());
      }
    });

    isInForm (): boolean {
        return ((this.subName != null) && (this.formGroup()!=null));
    }

    formControlNameOrNull():string|null {
        return this.subName??null;
    }

    value ():T | null | undefined {
      if (this.nonFormValue!=null)
        return this.nonFormValue()??this.formControlValue();
      else
        return this.formControlValue();
    }

    subValue (subsubName?:string):any | null | undefined {
      const value = this.nonFormValue??this.formControlValue();
      if ((subsubName != null) && (value != null)) {
        return value[subsubName as keyof typeof value];
      }else {
        return value;
      }
    }

    formControlValue (): T | null | undefined {
        if (this.isInForm()) {
          if (this.subName!=null) {
            return this.parentFormGroup?.value[this.subName];
          } else {
            return this.parentFormGroup?.value;
          }
        } else {
            return undefined;
        }
    }

    subContext(subName: string | undefined | null, typeResolver?:XtTypeResolver<XtContext<T>>): XtContext<T> {
        if ((subName==null) || (subName.length==0)) {
            return this;
        } else {
            let subValue:WritableSignal<any|null> | null = null;
            let parentGroup = this.formGroup();
            // Recalculate parentGroup and formControlName and value if needed.
            if (parentGroup!=null) {
                let control = parentGroup.get (subName);
                if (control instanceof FormGroup) {
                    parentGroup = control as FormGroup;
                }
            } else {
              let curValue = this.nonFormValue;
              if (curValue!=null){
                if (curValue()!=null) {
                  subValue = signal ((curValue() as any)[subName]);
                }
              }
              if (subValue==null) {
                subValue = signal (null);
              }
            }

            const ret = new XtBaseContext<T> (this.displayMode, subName, parentGroup);
            if( subValue!=null) ret.nonFormValue=subValue;

            if ((this.valueType!=null) && (typeResolver!=null)) {
                ret.valueType=typeResolver.findType(this, subName, this.value())??undefined;
            }
            return ret;
        }
    }

    formGroup (): FormGroup|undefined {
        return this.localFormGroup??this.parentFormGroup;
    }

  toString():string {
      let ret='XtContext named ';
      ret += this.subName??'None';
      ret += ' with type ';
      ret += this.valueType??'None';
      ret +=' with value ';
      ret += this.nonFormValue??'Unknown';
      return ret;
  }
}

