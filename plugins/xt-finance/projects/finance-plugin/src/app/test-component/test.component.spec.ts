import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestComponent } from './test.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { registerFinancePlugin } from '../../../../finance/src/lib/register';
import { XtResolverService } from 'xt-components';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DummyCurrencyComponent } from '../dummy-currency/dummy-currency.component';

describe('TestComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let resolver:XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]
    })
    .compileComponents();

    resolver = TestBed.inject(XtResolverService);
    // Add the currency plugin to allow test
    resolver.registerPlugin({
      name:'dummy-currency',
      components:[{
        componentName:'DummyCurrency',
        componentClass: DummyCurrencyComponent,
        typesHandled:['currency']
      }],
      types: {
        currency: 'string'
      }
    });

    registerFinancePlugin(TestBed.inject(XtResolverService));
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
