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
  @let cont=context();\
  @if (value!=null) {\
    @if (cont.displayMode=="INLINE_VIEW") {\
      {{value.fullName}}&nbsp;({{value.city}})\
     } @else {\
      {{value.fullName}}&nbsp; Born in {{value.city}}, the {{value.born | date}}\
      }\
  }\
  \
  }',
})

export class TestAuthorComponent extends XtSimpleComponent<AuthorTestType> {
}
