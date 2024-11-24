import { FormGroup } from "@angular/forms"
import { XtTypeResolver } from "./type/xt-type-resolver";

export type XtContext<T> = {

    displayMode: XtDisplayMode;

    subName?: string; // The subName in the parentFormGroup and parentContext
    parentFormGroup?: FormGroup;
    localFormGroup?:FormGroup;
    nonFormvalue?: T | null;

    isInForm (): boolean;

    formGroup () : FormGroup | undefined;

    formControlNameOrNull():string|null;

    formControlValue (): any | null;

    value ():T | null | undefined;

    subValue (subName?:string):T | null | undefined;

    subContext(subName: string | undefined | null, typeResolver?: XtTypeResolver<XtContext<T>>): XtContext<T>;

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
     * When not editable, the value is here
     */
    nonFormvalue?: T;

    valueType?:string;

    /**
     *
     * @param displayMode
     * @param readOnly
     * @param parentGroup
     * @param controlName
     */

    constructor (displayMode: XtDisplayMode,subName?: string, parentGroup?: FormGroup )
    {
        this.displayMode=displayMode;
        this.parentFormGroup=parentGroup;
        this.subName=subName;
    }

    setNonFormValue (newValue:T|undefined, type?:string): XtBaseContext<T> {
        this.nonFormvalue=newValue;
        if (type!=undefined)
          this.valueType = type;
        return this;
    }

    isInForm (): boolean {
        return ((this.subName != null) && (this.formGroup()!=null));
    }

    formControlNameOrNull():string|null {
        return this.subName??null;
    }

    value ():T | null | undefined {
        return this.nonFormvalue??this.formControlValue();
    }

    subValue (subsubName?:string):any | null | undefined {
      const value = this.nonFormvalue??this.formControlValue();
      if ((subsubName != null) && (value != null)) {
        return value[subsubName as keyof typeof value];
      }else {
        return value;
      }
    }

  formControlValue (): T | null | undefined {
        if (this.isInForm()) {
            return this.parentFormGroup?.value[this.subName!];
        } else {
            return undefined;
        }
    }

    subContext(subName: string | undefined | null, typeResolver?:XtTypeResolver<XtContext<T>>): XtContext<T> {
        if ((subName==null) || (subName.length==0)) {
            return this;
        } else {
            let parentGroup = this.formGroup();
            let value = this.nonFormvalue;
            // Recalculate parentGroup and formControlName and value if needed.
            if (parentGroup!=null) {
                let control = parentGroup.get (subName);
                if (control instanceof FormGroup) {
                    parentGroup = control as FormGroup;
                }
            } else if (value!=null) {
                value = (value as any)[subName];
            }

            const ret = new XtBaseContext<T> (this.displayMode, subName, parentGroup);
            ret.nonFormvalue=value;
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
      ret += this.nonFormvalue??'Unknown';
      return ret;
  }
}

