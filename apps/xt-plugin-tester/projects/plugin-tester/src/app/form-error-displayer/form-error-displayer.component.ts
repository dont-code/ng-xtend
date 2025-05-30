import { ChangeDetectionStrategy, Component, computed, input, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Panel } from 'primeng/panel';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-form-error-displayer',
  imports: [
    Panel,
    JsonPipe
  ],
  templateUrl: './form-error-displayer.component.html',
  styleUrl: './form-error-displayer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormErrorDisplayerComponent implements OnInit, OnDestroy{

    form = input.required<FormGroup> ();

    errors= signal<any>(null);
    hasError = computed(() => {
      return this.errors()!=null;
    });
    subscriptions = new Subscription();

    ngOnInit() {
      this.subscriptions.add(this.form().statusChanges.subscribe((status) => {
        if (status == 'VALID') {
          this.errors.set(null);
        }else {
          let errorJson={};
          this.fillErrors (this.form(),errorJson)
          this.errors.set(errorJson);
        }
      }));
    }

  fillErrors(rom: AbstractControl, errorJson: any) {
      errorJson.errors=rom.errors;
      if ((rom as FormGroup).controls!=null) {
        for (const sub in (rom as FormGroup).controls) {
          errorJson[sub]={};
          this.fillErrors(rom.get(sub)!, errorJson[sub]);
        }
      }
    }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
