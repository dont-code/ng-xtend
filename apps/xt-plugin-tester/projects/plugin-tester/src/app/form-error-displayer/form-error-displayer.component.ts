import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Displays the validation errors of a form as a readable list.
 *
 * It listens to the form status changes and, whenever the form is invalid,
 * walks the control tree collecting the errors.
 */
@Component({
  selector: 'app-form-error-displayer',
  imports: [],
  templateUrl: './form-error-displayer.component.html',
  styleUrl: './form-error-displayer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormErrorDisplayerComponent implements OnInit, OnDestroy {
  form = input.required<FormGroup>();

  errors = signal<any>(null);

  hasError = computed(() => this.errors() != null);

  /** Flat, human readable list of validation problems. */
  errorMessages = computed<string[]>(() => {
    const tree = this.errors();
    if (tree == null) return [];
    const out: string[] = [];
    this.collect(tree, '', out);
    return out;
  });

  subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.form().statusChanges.subscribe((status) => {
        if (status === 'VALID') {
          this.errors.set(null);
        } else {
          const errorJson: any = {};
          this.fillErrors(this.form(), errorJson);
          this.errors.set(errorJson);
        }
      })
    );
  }

  fillErrors(rom: AbstractControl, errorJson: any): void {
    errorJson.errors = rom.errors;
    if ((rom as FormGroup).controls != null) {
      for (const sub in (rom as FormGroup).controls) {
        errorJson[sub] = {};
        this.fillErrors(rom.get(sub)!, errorJson[sub]);
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private collect(node: any, prefix: string, out: string[]): void {
    if (node == null) return;
    if (node.errors != null) {
      for (const key in node.errors) {
        out.push(`${this.humanize(prefix)} ${this.describe(key, node.errors[key])}`.trim());
      }
    }
    for (const sub in node) {
      if (sub === 'errors') continue;
      this.collect(node[sub], prefix ? `${prefix} ${sub}` : sub, out);
    }
  }

  private humanize(field: string): string {
    if (field.length === 0) return 'This field';
    return field
      .split(/[ .]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private describe(key: string, value: any): string {
    switch (key) {
      case 'required':
        return 'is required.';
      case 'pattern':
        return 'has an invalid format.';
      case 'email':
        return 'must be a valid email.';
      case 'minlength':
        return `needs at least ${value?.requiredLength} characters.`;
      case 'maxlength':
        return `accepts at most ${value?.requiredLength} characters.`;
      case 'min':
        return `must be at least ${value?.min}.`;
      case 'max':
        return `must be at most ${value?.max}.`;
      default:
        return `is invalid (${key}).`;
    }
  }
}
