import { FormGroup } from '@angular/forms';
import { isTypeReference, XtBaseTypeReference, XtTypeHierarchy, XtTypeReference, XtTypeResolver } from 'xt-type';
import { computed, Signal, signal, WritableSignal } from '@angular/core';
import { XtAction } from './action/xt-action';
import { XtPluginRegistry } from './registry/xt-plugin-registry';

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

  /**
   * When the value in the context is a reference to another type
   */
  reference?:XtTypeReference

  /**
   * If it's a reference, we keep the context referenced
   */
  referencedContext?:XtContext<any>;

  /**
   * creates the referencedContext by using this referenced value
   * @param val
   *
  updateReferencedContext(val: any, valueType?:string): void;*/

  /**
   * Signal when all the asynchronously defined subreferences are resolved.
   *
  subReferencesResolved: WritableSignal<boolean>;
*/

  // A parentContext if defined
  parentContext?:XtContext<any>;

  isInForm (): boolean;

  formGroup () : FormGroup | undefined;

  formControlNameOrNull():string|null;

  formControlValue (): any | null;

  subValue (subName?:string):T | null | undefined;

  subContext(subName: string | undefined | null, subType?:string, typeResolver?: XtTypeResolver | null): XtContext<any>;

  elementSetContext(subElement: any): XtContext<any>;

  displayValue: Signal<T|null>;

  setDisplayValue (newValue:T|null|undefined, type?:string): XtContext<T>;

  setFormValue (newValue:T|null|undefined, markAsDirty?:boolean): boolean;

  value(): T | null | undefined;

  valueType?:string;

  toString (): string;

  listActions: WritableSignal<XtAction<T>[] | null>;

  isReference ():boolean;

  setReferenceInfo (ref:XtTypeReference):void;

}

/** Display modes controlling how a value is presented: inline, full view, editable, or list. */
export type XtDisplayMode = 'INLINE_VIEW'|'FULL_VIEW'|'FULL_EDITABLE'|'LIST_VIEW';

/**
 * Base implementation of the XtContext interface.
 * Manages display mode, form integration, child context hierarchy, and value tracking
 * for an ng-extended component.
 */
export class XtBaseContext<T> implements XtContext<T>{
  /** The current display mode for this context. Defaults to FULL_VIEW. */
  displayMode: XtDisplayMode = 'FULL_VIEW';

  /**
   * When editable, the value is stored in a parent formGroup
   */
  subName?: string;
  /** The parent FormGroup when this context is a child within a reactive form. */
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

  /** The type identifier for the value contained in this context. */
  valueType?:string;

  /**
   * When the value in the context is a reference to another type
   */
  reference?:XtTypeReference;

  /**
   * If it's a reference, we keep the context referenced
   *
  referencedContext?:XtContext<any>;*/

  //subReferencesResolved = signal(false);

  /**
   * Keeps track of all the possible actions for this context
   * @protected
   */
  listActions = signal<XtAction<T>[]|null>(null);

    /**
     * Creates a new XtBaseContext instance.
     * @param displayMode - The display mode for this context
     * @param subName - Optional sub-name used within a parent form group
     * @param parentGroup - Optional parent FormGroup for reactive form integration
     * @param parentContext - Optional parent context for hierarchy management
     */
    constructor (displayMode: XtDisplayMode, subName?: string, parentGroup?: FormGroup, parentContext?:XtBaseContext<any>)
    {
        this.displayMode=displayMode;
        this.parentFormGroup=parentGroup;
        this.parentContext=parentContext;
        this.subName=subName;
        if ((parentGroup!=null) && (subName!=null)) {
          const subControl=parentGroup.get(subName);
          // If it's a form group, then it should be set as localFormGroup
          if ((subControl as FormGroup)?.controls!=null) {
            this.localFormGroup=subControl as FormGroup;
          }
        }
    }

    /**
     * Sets the display value for this context when not managed by a reactive form.
     * Propagates changes to child contexts and optionally notifies the parent context.
     * @param newValue - The new value to set
     * @param type - Optional type identifier to assign
     * @param updateParent - Whether to propagate the change to the parent context (default true)
     * @returns This context instance for chaining
     */
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

    /** Computed signal that returns the current display value from non-form storage. */
    displayValue = computed( ()=>  {
      if (this.nonFormValue!==undefined) {
        return this.nonFormValue();
      } else {
        throw new Error ("Cannot display a value that does not exist. Are you sure you're not using Reactive Form with this context? "+ this.toString());
      }
    });

    /**
     * Checks whether this context is bound to a reactive form group.
     * @returns True if a form group exists
     */
    isInForm (): boolean {
        return (this.formGroup()!=null);
    }

    /**
     * Returns the sub-name used as the form control name, or null if not in a form.
     * @returns The sub-name or null
     */
    formControlNameOrNull():string|null {
        return this.subName??null;
    }

    /**
     * Returns the current value from either the non-form signal or the form control.
     * @returns The current value, or null/undefined
     */
    value ():T | null | undefined {
      if (this.nonFormValue!=null)
        return this.nonFormValue()??this.formControlValue();
      else
        return this.formControlValue();
    }

    /**
     * Returns a sub-value by name from the current value object.
     * @param subsubName - Optional sub-key to retrieve from the value object
     * @returns The sub-value or the full value if no key is given
     */
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

  /**
   * Retrieves the value from the parent form group for this context's sub-name.
   * @returns The form control value, or undefined if not in a form
   */
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

  /**
   * Sets the value in the parent form group for this context's sub-name.
   * @param newValue - The new value to set on the form control
   * @param markAsDirty - Whether to mark the control as dirty (default false)
   * @returns True if the value was successfully set
   */
  setFormValue (newValue:T|null|undefined, markAsDirty=false): boolean {
    if (this.isInForm()) {
      if (this.subName!=null) {
        const control=this.parentFormGroup?.get(this.subName);
        if (control!=null) {
          control.setValue(newValue);
          if (markAsDirty) {
            control.markAsDirty();
          }
          return true;
        } else {
            // Supports setting values without a child form control
          const value=this.parentFormGroup?.getRawValue();
          if (value!=null) {
            if (newValue!==undefined)
              value[this.subName]=newValue;
            else
              delete value[this.subName];
          }
        }
      }
    }
    return false;
  }


  /**
   * Returns the context associated with a specific element in a set.
   * Value must be an array.
   * @param elementIndex
   */
  elementSetContext(elementIndex:number): XtContext<any> {
    const value = this.value();

    if (!Array.isArray(this.value())) {
      throw new Error ("The value must be an Array / Set to create a subElement context.")
    }

    const indexKey = elementIndex.toString();
    let ret = this.childContexts?.get(indexKey);

    if( ret==null) {
      ret = new XtBaseContext<T>(this.displayMode, undefined, undefined, this);
      ret.setDisplayValue((value as any[])[elementIndex]);

      if (this.valueType != null) {
        // Convert potential array type into single type
        ret.valueType = this.valueType.endsWith('[]') ? this.valueType.substring(0, this.valueType.length - 2) : this.valueType;
      }
      if( this.childContexts==null) this.childContexts=new Map<string, XtBaseContext<any>>();
      this.childContexts?.set(indexKey, ret);
    }
    return ret;
  }

  /**
   * Returns or creates a child context for the given sub-name.
   * Resolves type information and references when a typeResolver is provided.
   * @param subName - The sub-name for the child context
   * @param subType - Optional type hint for the child
   * @param typeResolver - Optional type resolver for resolving sub-types and references
   * @returns The child XtContext
   */
  subContext(subName: string | undefined | null, subType?:string,  typeResolver?:XtTypeResolver | null): XtContext<any> {
      if ((subName==null) || (subName.length==0)) {
          return this;
      } else if (this.childContexts?.has(subName)) {
        return this.childContexts?.get(subName)!;
      }else {
          let subValue:WritableSignal<any|null> | null = null;
          let currentGroup = this.formGroup();
          // Recalculate parentGroup and formControlName and value if needed.
          if (currentGroup==null){
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

          const ret = new XtBaseContext<T> (this.displayMode, subName, currentGroup, this);
          if( subValue!=null) ret.nonFormValue=subValue;

          if (subType!=null) {
            ret.valueType=subType;
          } else if ((this.valueType!=null) && (typeResolver!=null)) {
            const subType = typeResolver.findType(this.valueType, subName, this.value());
            if( subType!=null) {
              if (isTypeReference(subType)) {
                if( subType.type== XtBaseTypeReference.UNRESOLVED_TYPE) throw new Error ("You must resolve all reference types before using them in a context. Missing type "+subType.type+" for subName "+subName+" in valueType "+this.valueType+" of context "+this.toString())

                ret.valueType=subType.toType;
                ret.reference=subType;
                if (this.displayMode=='LIST_VIEW') ret.displayMode='INLINE_VIEW'; // We display a reference as inline in a list
                else if (this.displayMode=='FULL_EDITABLE') {
                  // We don't edit directly references, we simply enable selection of them.
                  ret.valueType=(subType.referenceType=='ONE-TO-MANY')?XtPluginRegistry.ANY_MULTIPLE_REFERENCE:XtPluginRegistry.ANY_SINGLE_REFERENCE;
                }
              } else {
                ret.valueType=(subType as XtTypeHierarchy).type;
              }
            }
            //ret.valueType=typeResolver.findTypeName(this.valueType, subName, this.value())??undefined;
          }

          if (this.childContexts==null) this.childContexts=new Map<string, XtBaseContext<any>>();
          this.childContexts.set(subName, ret);
          return ret;
      }
    }

    /**
     * Returns the available form group, preferring localFormGroup over parentFormGroup.
     * @returns The form group or undefined
     */
    formGroup (): FormGroup|undefined {
        return this.localFormGroup??this.parentFormGroup;
    }

  /**
   * Checks whether this context holds a reference to another type.
   * @returns True if a reference is set
   */
  isReference ():boolean {
    return (this.reference!=null);
  }

  /**
   * Sets the type reference information for this context.
   * @param reference - The type reference to set
   */
  setReferenceInfo (reference:XtTypeReference):void {
    this.reference=reference;
    //this.subReferencesResolved.set(this.reference!=null);
  }

  /**
   * creates the referencedContext by using this referenced value
   * @param val
   *
  updateReferencedContext(val: any, valueType?:string): void {
    if (!this.isReference()) throw new Error ('This context '+this.toString()+' is not a reference.');

    if( this.referencedContext==null) {
      let refDisplayMode = 'INLINE_VIEW' as XtDisplayMode;
      if (this.displayMode=='FULL_VIEW') refDisplayMode = 'FULL_VIEW';
      this.referencedContext = new XtBaseContext(refDisplayMode);
    }
    this.referencedContext.setDisplayValue(val);
    if( valueType!=null) this.referencedContext.valueType=valueType;
  }*/

  /**
   * Returns a string representation of this context, including its name, type, value, and reference info.
   * @returns A human-readable description of the context
   */
  toString():string {
      let ret='XtContext named ';
      ret += this.subName??'None';
      ret += ' with type ';
      ret += this.valueType??'None';
      ret +=' with value ';
      ret += this.nonFormValue?this.nonFormValue():this.formControlValue();
      if (this.isReference()) {
        ret +=' referencing ';
        ret += this.reference?.type
      }
      return ret;
  }
}
