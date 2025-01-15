import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultPrimitiveComponent } from './default-primitive.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { registerDefaultPlugin } from '../register';
import { HostTestTypedFormComponent, XtBaseContext, XtResolverService } from 'xt-components';
import { By } from '@angular/platform-browser';
import { DatePicker } from 'primeng/datepicker';
import { expect } from '@jest/globals';

describe('DefaultPrimitiveComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultPrimitiveComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    registerDefaultPlugin(TestBed.inject(XtResolverService))

  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DefaultPrimitiveComponent);
    const context= new XtBaseContext<string>('FULL_VIEW');
    context.setDisplayValue("");
    fixture.componentRef.setInput('context', context);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should edit text', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      value:['Text']
    });
    hostFixture.componentRef.setInput('controlName', 'value');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const textComponent = hostFixture.debugElement.query(By.directive(DefaultPrimitiveComponent));
    expect(textComponent).toBeTruthy();
    const input = textComponent.query(By.css('input'));

    expect(input.nativeElement.value).toEqual ('Text');

    host.computedFormGroup().patchValue({'value':"NewText"});
    hostFixture.detectChanges();
    expect(input.nativeElement.value).toEqual ("NewText");
  });

  it('should edit Date', () => {
    const date1=new Date(2024,1,4);
    const date2=new Date(2025,1,4);

    const hostFixture = TestBed.createComponent<HostTestTypedFormComponent>(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      value:[date1]
    });
    hostFixture.componentRef.setInput('controlName', 'value');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const dateComponent = hostFixture.debugElement.query(By.directive(DefaultPrimitiveComponent));
    expect(dateComponent).toBeTruthy();
    const inputDate = dateComponent.query(By.directive(DatePicker));
    expect(inputDate).toBeTruthy();

    expect(inputDate.componentInstance.value).toEqual (date1 );

    host.computedFormGroup().patchValue({'value':date2});
    hostFixture.detectChanges();
    expect(inputDate.componentInstance.value).toEqual (date2);
  });

  it('should edit Boolean with a checkbox', () => {

    const hostFixture = TestBed.createComponent<HostTestTypedFormComponent>(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      value:[true]
    });
    hostFixture.componentRef.setInput('controlName', 'value');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const booleanComponent = hostFixture.debugElement.query(By.directive(DefaultPrimitiveComponent));
    expect(booleanComponent).toBeTruthy();
    const checkbox =booleanComponent.query(By.css('input[type="checkbox"]'));

    expect(checkbox.nativeElement.checked).toEqual (true);
    checkbox.nativeElement.checked = false;
    checkbox.nativeElement.dispatchEvent(new Event('change'));
    hostFixture.detectChanges();

    expect(host.computedFormGroup().value).toEqual ({ value: false });
  });

});
