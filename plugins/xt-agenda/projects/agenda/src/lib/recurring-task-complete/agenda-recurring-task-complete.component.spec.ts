import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaRecurringTaskCompleteComponent } from './agenda-recurring-task-complete.component';

describe('RecurringTaskComplete', () => {
  let component: AgendaRecurringTaskCompleteComponent;
  let fixture: ComponentFixture<AgendaRecurringTaskCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaRecurringTaskCompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaRecurringTaskCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
