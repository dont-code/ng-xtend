import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntlCurrencyComponent } from './intl-currency.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { HostTestTypedComponent, HostTestTypedFormComponent, XtBaseContext, XtResolverService } from 'xt-components';
import { registerInternationalPlugin } from '../register';
import { By } from '@angular/platform-browser';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';

describe('XtCurrencyComponent', () => {

  beforeAll(() => {
    setupAngularTestBed();
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntlCurrencyComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    registerInternationalPlugin(TestBed.inject(XtResolverService));
  });

  it('should create', () => {
    let component: IntlCurrencyComponent;
    let fixture: ComponentFixture<IntlCurrencyComponent>;
    fixture = TestBed.createComponent(IntlCurrencyComponent);
    component = fixture.componentInstance;
    const context= new XtBaseContext<string>('FULL_VIEW');
    context.setDisplayValue("");
    fixture.componentRef.setInput('context', context);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should support currency display', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedComponent);
    hostFixture.componentRef.setInput('value', 'EUR');
    hostFixture.componentRef.setInput('valueType', 'currency');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.textContent).toContain('EUR');

    hostFixture.componentRef.setInput('value', 'USD');
    hostFixture.detectChanges();
    expect(hostFixture.nativeElement.textContent).toContain('USD');

  });

  it('should support currency edit', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      currency:'EUR'
    });
    hostFixture.componentRef.setInput('valueType', 'currency');
    hostFixture.componentRef.setInput('controlName', 'currency');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const currencyComponent = hostFixture.debugElement.query(By.directive(IntlCurrencyComponent));
    expect(currencyComponent).toBeTruthy();
    const input = currencyComponent.query(By.css('input'));

    expect(input.nativeElement.value).toEqual ('EUR');

    host.computedFormGroup().patchValue({'currency':"USD"});
    hostFixture.detectChanges();
    expect(input.nativeElement.value).toEqual ("USD");

  });

});
