import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerInternationalPlugin } from '../register';
import { XtBaseContext, XtResolverService } from 'xt-components';
import { IntlCountryComponent } from './intl-country.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('IntlCountryComponent', () => {
  let component: IntlCountryComponent;
  let fixture: ComponentFixture<IntlCountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntlCountryComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    registerInternationalPlugin(TestBed.inject(XtResolverService));
  });

  it('should create', () => {
    fixture = TestBed.createComponent(IntlCountryComponent);
    component = fixture.componentInstance;
    const context= new XtBaseContext<string>('FULL_VIEW');
    context.setDisplayValue("FRA");
    fixture.componentRef.setInput('context', context);
    fixture.detectChanges();

    expect(component).toBeTruthy();

  });
});
