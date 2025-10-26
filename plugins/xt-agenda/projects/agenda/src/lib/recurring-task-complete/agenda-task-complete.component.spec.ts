import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaTaskCompleteComponent } from './agenda-task-complete.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { XtBaseContext } from 'xt-components';

describe('RecurringTaskComplete', () => {
  let component: AgendaTaskCompleteComponent;
  let fixture: ComponentFixture<AgendaTaskCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaTaskCompleteComponent]
    })
    .compileComponents();

  });

  it('should create Task complete button', () => {
    fixture = TestBed.createComponent(AgendaTaskCompleteComponent);
    const context=new XtBaseContext<any>('FULL_VIEW');
    context.setDisplayValue(true);
    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
