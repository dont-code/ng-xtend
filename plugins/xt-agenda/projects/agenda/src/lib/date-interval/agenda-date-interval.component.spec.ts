import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';
import { XtBaseContext } from 'xt-components';
import { By } from '@angular/platform-browser';
import { AgendaDateIntervalComponent } from './agenda-date-interval.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SelectItem } from 'primeng/select';

describe('AgendaDateIntervalComponent', () => {
  let component: AgendaDateIntervalComponent;
  let fixture: ComponentFixture<AgendaDateIntervalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaDateIntervalComponent],
    providers: [provideNoopAnimations()]
    })
    .compileComponents();

  });

  it('should display interval', () => {
    fixture = TestBed.createComponent(AgendaDateIntervalComponent);
    const context=new XtBaseContext<any>('FULL_VIEW');
    context.setDisplayValue({
     every:3,
     item:"Month"
    });
    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    const textContent=fixture.debugElement.query(By.css('span') ).nativeElement.textContent;
    expect(textContent).contains('3');
    expect(textContent).contains('Month');

  });

  it ('should edit interval', async () => {
    fixture = TestBed.createComponent(AgendaDateIntervalComponent);
    const builder = TestBed.inject(FormBuilder);
    const formGroup=builder.group({
      test:builder.group({
        every: [3], item: ["Month"]
      })
    })
    const context=new XtBaseContext<any>('FULL_EDITABLE', 'test', formGroup);
    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();

    const numberInput=fixture.debugElement.query(By.directive(InputNumber) );
    expect (numberInput.componentInstance.value).toBe(3);
    const itemInput=fixture.debugElement.query(By.css('.p-select-dropdown') );
    expect(itemInput).toBeTruthy();
    itemInput.nativeElement.click();
    fixture.detectChanges();
    const selectItems = fixture.debugElement.queryAll(By.directive(SelectItem) );
    expect(selectItems.length).toEqual(4);
    selectItems[1].children[0].nativeElement.click();
    fixture.detectChanges();

    await fixture.whenStable();
    expect(formGroup.get('test')?.value).toEqual({
      every:3,
      item:'Week'
    });
  });
});
