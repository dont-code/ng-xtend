import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebImageComponent } from './web-image.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { StoreTestHelper, XtBaseContext } from 'xt-components';
import { setupAngularTestBed } from '../../../globalTestSetup';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('WebImageComponent', () => {
  let component: WebImageComponent;
  let fixture: ComponentFixture<WebImageComponent>;
  beforeAll(() => {
    setupAngularTestBed();
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebImageComponent],
      providers: [provideNoopAnimations(), provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    StoreTestHelper.ensureTestProviderOnly();

    fixture = TestBed.createComponent(WebImageComponent);
    const context= new XtBaseContext<string>('FULL_VIEW');
    context.setDisplayValue('https://dont-code.net/assets/images/logos/logo-xtend-angular-red-small.png');
    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
