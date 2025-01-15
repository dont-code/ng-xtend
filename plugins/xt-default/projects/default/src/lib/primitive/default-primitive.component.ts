import { Component, computed, inject, Injector, OnDestroy, runInInjectionContext, signal } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
import { ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Checkbox } from 'primeng/checkbox';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { Subscription } from 'rxjs';

/**
 * Displays / edits primitive types (string, numeric) using text inputs to ensure at least something is managed.
 */
@Component({
  selector: 'xt-default-primitive',
  imports: [
    ReactiveFormsModule,
    InputText,
    Checkbox,
    InputNumber,
    DatePicker
  ],
  templateUrl: './default-primitive.component.html',
  styleUrl: './default-primitive.component.css'
})
export class DefaultPrimitiveComponent extends XtSimpleComponent implements OnDestroy{

  injector = inject(Injector);

  recalculate = signal<boolean> (false);
  valueSubscription: Subscription|null = null;

  /**
   * This function tries to guess the type of value to be handled
   */
  typeOf = computed (() => {
    this.recalculate(); // In case recompute is forced
    if(this.context().valueType == null) {
          // The type has not been set, so let's see if we can guess it from the value
      const val = this.getValue();
      if (val == null) {   // We really can't know the type
        if (this.valueSubscription==null) {
          // Let's make sure a change of the value is taken into account
          runInInjectionContext(this.injector, () => {
            this.valueSubscription=this.formControl().valueChanges.subscribe({
              next: () => {
                this.recalculate.update((val) => !val);
              }
            });
          });
        }
        return val;
      } else {
        const ret= typeof val;
        if (ret != 'object') {
          this.context().valueType = typeof val;
          return ret;
        }else if (val instanceof Date) {
          this.context().valueType = 'date';
          return 'date';
        } else {
          throw new Error('Primitive Component used to display a non primitive type '+ret);
        }
      }
    } else {
      return this.context().valueType;
    }
  });

  ngOnDestroy(): void {
    if (this.valueSubscription!=null) {
      this.valueSubscription.unsubscribe();
    }
  }
}
