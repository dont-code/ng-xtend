import { FormGroup } from '@angular/forms';
import { XtTypeResolver } from './type/xt-type-resolver';
import { computed, Signal, signal, WritableSignal } from '@angular/core';

/**
 * A XtContext provides all the necessary information for an ng-extended component to operate. It is passed from parent to child component and pass
 * - The display mode - View, Inline view or Edit
 * - The value, either directly as a signal or in a formgroup when editing.
 * - The valueType, necessary to find the right ng-extended component to display
 *
 * To do this, it maintains a hierarchy of context and subContexts by name.
 */
export type XtContext<T> = {

    displayMode: XtDisplayMode;

    subName?: string; // The subName in the parentFormGroup and parentContext
    parentFormGroup?: FormGroup;
    localFormGroup?: FormGroup;

    // A parentContext if defined
    parentContext?:XtContext<any>;

    isInForm (): boolean;

    formGroup () : FormGroup | undefined;

    formControlNameOrNull():string|null;

    formControlValue (): any | null;

    subValue (subName?:string):T | null | undefined;

    subContext(subName: string | undefined | null, subType?:string, typeResolver?: XtTypeResolver<XtContext<T>> | null): XtContext<T>;

    displayValue: Signal<T|null>;

    setDisplayValue (newValue:T|null|undefined, type?:string): XtContext<T>;

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
     * When the context is a child, it potentially needs to update its parent value
     */
    parentContext?:XtBaseContext<any>;

    /**
     * All child contexts are kept in this map
     */
    protected childContexts?:Map<string, XtBaseContext<any>>;

  /**
   * localFormGroup exists only for composite components: it's children are all gathered in a form group
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

    constructor (displayMode: XtDisplayMode, subName?: string, parentGroup?: FormGroup, parentContext?:XtBaseContext<any>)
    {
        this.displayMode=displayMode;
        this.parentFormGroup=parentGroup;
        this.parentContext=parentContext;
        this.subName=subName;
    }

    setDisplayValue (newValue:T|null|undefined, type?:string, updateParent:boolean=true): XtBaseContext<T> {
      if (newValue!==undefined){
        const oldValue = this.nonFormValue?this.nonFormValue():null;
        if (this.nonFormValue==null) {
          if ((this.childContexts!=null) && (this.childContexts.size>0)) throw new Error ('An XtContext with no values cannot have children ',{cause:this});
          this.nonFormValue=signal(newValue);
        }else {
          this.nonFormValue.set(newValue);
        }

        // Change the children values if needed
        if (this.childContexts!=null) {
          if (newValue==null) {
            for (const [subName, child] of this.childContexts) {
              child.setDisplayValue(null, undefined, false);
            }

          } else if (oldValue!=null) {
            for (const [subName, child] of this.childContexts) {
              if (newValue[subName as keyof T]!=oldValue[subName as keyof T]) {
                // The value has changed, let's update
                child.setDisplayValue(newValue[subName as keyof T], undefined, false);
              }
            }
          }
        }

        if ((updateParent) && (this.subName!=null))
          this.parentContext?.updateSubDisplayValue(this.subName,newValue);
      }

      if (type!==undefined)
        this.valueType = type;
      return this;
    }

    displayValue = computed( ()=>  {
      if (this.nonFormValue!==undefined) {
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
      const value = this.nonFormValue?this.nonFormValue():this.formControlValue();
      if ((subsubName != null) && (value != null)) {
        return value[subsubName as keyof typeof value];
      }else {
        return value;
      }
    }

  /**
   * Enable child contexts to update its own value in the parent context whenever it's value changes
   */
  protected updateSubDisplayValue (subName:string, subValue:any): void {
    if (this.nonFormValue!=null) {
      let newValue = this.nonFormValue();
      if (newValue==null) {
        const newValue = {} as T;
        newValue[subName as keyof T]=subValue
        this.nonFormValue.set(newValue);
      } else {
        newValue[subName as keyof T] = subValue; // Discretly update the subValue without triggering parent signal
      }
    } else {
      throw new Error ("No nonFormValue to update subDisplayValue"+this.toString());
    }
  }

  formControlValue (): T | null | undefined {
    let ret:T|undefined|null=undefined;
    if (this.isInForm()) {
      if (this.subName!=null) {
        //console.debug ("formControlValue parentGroup value is ", this.parentFormGroup?.value);
        ret=this.parentFormGroup?.value[this.subName];
      } else {
        ret= this.parentFormGroup?.value;
      }
    } else {
        ret= undefined;
    }
    //console.debug("formControlValue of "+this.subName+ " is ",ret);
    return ret;
  }

    subContext(subName: string | undefined | null, subType?:string,  typeResolver?:XtTypeResolver<XtContext<T>> | null): XtContext<T> {
        if ((subName==null) || (subName.length==0)) {
            return this;
        } else if (this.childContexts?.has(subName)) {
          return this.childContexts?.get(subName)!;
        }else {
            let subValue:WritableSignal<any|null> | null = null;
            let parentGroup = this.formGroup();
            // Recalculate parentGroup and formControlName and value if needed.
            if (parentGroup==null){
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

            const ret = new XtBaseContext<T> (this.displayMode, subName, parentGroup, this);
            if( subValue!=null) ret.nonFormValue=subValue;

            if (subType!=null) {
              ret.valueType=subType;
            } else if ((this.valueType!=null) && (typeResolver!=null)) {
                ret.valueType=typeResolver.findType(this, subName, this.value())??undefined;
            }

            if (this.childContexts==null) this.childContexts=new Map<string, XtBaseContext<any>>();
            this.childContexts.set(subName, ret);
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
      ret += this.nonFormValue?this.nonFormValue():this.formControlValue();
      return ret;
  }
}
