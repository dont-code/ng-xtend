import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerInternationalPlugin } from '../register';
import { XtBaseContext, XtResolverService } from 'xt-components';
import { IntlCountryComponent } from './intl-country.component';
import { CountryTypeHandler } from './country-type-handler';
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

  it('should be sortable by country name through its type handler', () => {
    const resolverService = TestBed.inject(XtResolverService);
    const found = resolverService.typeResolver.findTypeHandler('country');
    expect(found.typeName).toEqual('string');
    const handler = found.handler!;
    expect(handler).toBeInstanceOf(CountryTypeHandler);
    expect(handler.isSortable()).toBe(true);

    // FRA=France, DEU=Germany, BRA=Brazil, USA=United States of America
    expect(handler.compareTo('FRA', 'DEU')).toBeLessThan(0);
    expect(handler.compareTo('BRA', 'FRA')).toBeLessThan(0);
    expect(handler.compareTo('FRA', 'FRA')).toBe(0);

    const countries = ['FRA', 'DEU', 'BRA', 'USA'];
    const sorted = [...countries].sort((a, b) => handler.compareTo(a, b));
    expect(sorted).toEqual(['BRA', 'FRA', 'DEU', 'USA']);
  });
});
