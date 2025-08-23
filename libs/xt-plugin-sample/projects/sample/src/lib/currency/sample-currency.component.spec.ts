import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleCurrencyComponent } from './sample-currency.component';
import {provideExperimentalZonelessChangeDetection} from "@angular/core";
import { XtBaseContext,HostTestTypedComponent, HostTestTypedFormComponent, XtResolverService } from 'xt-components';
import { registerSamplePlugin } from '../register';
import { By } from '@angular/platform-browser';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';

describe('XtCurrencyComponent', () => {

  beforeAll(() => {
    setupAngularTestBed();
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleCurrencyComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    registerSamplePlugin(TestBed.inject(XtResolverService));
  });

  it('should create', () => {
    let component: SampleCurrencyComponent;
    let fixture: ComponentFixture<SampleCurrencyComponent>;
    fixture = TestBed.createComponent(SampleCurrencyComponent);
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
    hostFixture.componentRef.setInput('valueType', 'sampleCurrency');

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
    hostFixture.componentRef.setInput('valueType', 'sampleCurrency');
    hostFixture.componentRef.setInput('controlName', 'currency');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const currencyComponent = hostFixture.debugElement.query(By.directive(SampleCurrencyComponent));
    expect(currencyComponent).toBeTruthy();
    const input = currencyComponent.query(By.css('input'));

    expect(input.nativeElement.value).toEqual ('EUR');

    host.computeFormGroup().patchValue({'currency':"USD"});
    hostFixture.detectChanges();
    expect(input.nativeElement.value).toEqual ("USD");

  });

});
