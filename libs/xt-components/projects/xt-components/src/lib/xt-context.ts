import { FormGroup } from "@angular/forms"
import { XtTypeResolver } from "./type/xt-type-resolver";

export type XtContext<T> = {

    displayMode: XtDisplayMode;

    formControlName?: string;
    parentFormGroup?: FormGroup;
    localFormGroup?:FormGroup;
    nonFormvalue?: T | null;

    isInForm (): boolean;

    formGroup () : FormGroup | undefined;

    formControlNameOrNull():string|null;

    formControlValue (): any | null;

    value ():T | null | undefined;

    subContext(subName: string | undefined | null, typeResolver?: XtTypeResolver<string>): XtContext<T>;

    valueType?:string;

}

export type XtDisplayMode = 'INLINE_VIEW'|'FULL_VIEW'|'FULL_EDITABLE';

export class XtBaseContext<T> implements XtContext<T>{
    displayMode: XtDisplayMode = 'FULL_VIEW';

    /**
     * When editable, the value is stored in a parent formGroup
     */
    formControlName?: string | undefined;
    parentFormGroup?: FormGroup<any> | undefined;
    localFormGroup?: FormGroup<any> | undefined;

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

    constructor (displayMode: XtDisplayMode,parentGroup?: FormGroup, controlName?: string)
    {
        this.displayMode=displayMode;
        this.parentFormGroup=parentGroup;
        this.formControlName=controlName;
    }

    setNonFormValue (newValue:T|undefined, type?:string): XtBaseContext<T> {
        this.nonFormvalue=newValue;
        this.valueType = type;
        return this;
    }

    isInForm (): boolean {
        return ((this.formControlName != null) && (this.formGroup()!=null));
    }

    formControlNameOrNull():string|null {
        return this.formControlName??null;
    }

    value ():T | null | undefined {
        return this.nonFormvalue??this.formControlValue();
    }

    formControlValue (): T | null | undefined {
        if (this.isInForm()) {
            return this.parentFormGroup?.value[this.formControlName!];
        } else {
            return undefined;
        }
    }

    subContext(subName: string | undefined | null, typeResolver?:XtTypeResolver<string>): XtBaseContext<T> {
        if ((subName==null) || (subName.length==0)) {
            return this;
        } else {
            let parentGroup = this.parentFormGroup;
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

            const ret = new XtBaseContext<T> (this.displayMode, parentGroup, subName);
            ret.nonFormvalue=value;
            if ((this.valueType!=null) && (typeResolver!=null))
                ret.valueType=typeResolver.findType(this.valueType, subName, this.value());
            return ret;
        }
    }

    formGroup (): FormGroup|undefined {
        return this.localFormGroup??this.parentFormGroup;
    }
}

