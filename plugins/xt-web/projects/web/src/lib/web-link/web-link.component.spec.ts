import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebLinkComponent } from './web-link.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';
import { setupAngularTestBed } from '../../../globalTestSetup';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { XtBaseContext } from 'xt-components';

describe('WebLinkComponent', () => {
  let component: WebLinkComponent;
  let fixture: ComponentFixture<WebLinkComponent>;

  beforeAll(() => {
    setupAngularTestBed();
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebLinkComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebLinkComponent);
    const context=new XtBaseContext('FULL_VIEW');
    context.setDisplayValue("https://www.dont-code.net");
    fixture.componentRef.setInput('context', context);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
