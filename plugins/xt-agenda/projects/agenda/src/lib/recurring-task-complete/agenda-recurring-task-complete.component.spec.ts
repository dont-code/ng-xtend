import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaRecurringTaskCompleteComponent } from './agenda-recurring-task-complete.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { XtBaseContext } from 'xt-components';

describe('RecurringTaskComplete', () => {
  let component: AgendaRecurringTaskCompleteComponent;
  let fixture: ComponentFixture<AgendaRecurringTaskCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaRecurringTaskCompleteComponent]
    })
    .compileComponents();

  });

  it('should create Task complete button', () => {
    fixture = TestBed.createComponent(AgendaRecurringTaskCompleteComponent);
    const context=new XtBaseContext<any>('FULL_VIEW');
    context.setDisplayValue(true);
    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
