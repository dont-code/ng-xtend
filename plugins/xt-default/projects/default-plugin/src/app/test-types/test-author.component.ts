import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
import { AuthorTestType } from './ref-test-types';

/**
 * A custom component is defined to display authors. It must be used by the set
 */
@Component({
  selector: 'test-author',
  standalone: true,
  imports: [CommonModule],
  template: '@if (isInForm()) {\
    \
    \
  } @else {\
  @let value=displayValue();\
  @if (value!=null) {\
    @if (context().displayMode=="INLINE_VIEW") {\
     {{value.fullName}}&nbsp;({{value.city}})\
     }\
  }\
  \
  }',
})

export class TestAuthorComponent extends XtSimpleComponent<AuthorTestType> {
}
