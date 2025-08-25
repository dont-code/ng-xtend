import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setupAngularTestBed } from '../../../globalTestSetup';
import { beforeAll, beforeEach, describe, it } from 'vitest';
import { registerInternationalPlugin } from '../register';
import { XtResolverService } from 'xt-components';
import { IntlCountryComponent } from './intl-country.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('IntlCountryComponent', () => {
  let component: IntlCountryComponent;
  let fixture: ComponentFixture<IntlCountryComponent>;

  beforeAll(() => {
    setupAngularTestBed();
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntlCountryComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    registerInternationalPlugin(TestBed.inject(XtResolverService));
  });

  it('should create', () => {
/*    fixture = TestBed.createComponent(IntlCountryComponent);
    component = fixture.componentInstance;
    const context= new XtBaseContext<string>('FULL_VIEW');
    context.setDisplayValue("");
    fixture.componentRef.setInput('context', context);
    fixture.detectChanges();

    expect(component).toBeTruthy();*/
  });
});
