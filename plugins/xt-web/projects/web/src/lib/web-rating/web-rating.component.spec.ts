import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebRatingComponent } from './web-rating.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { XtBaseContext } from 'xt-components';

describe('WebRatingComponent', () => {
  let component: WebRatingComponent;
  let fixture: ComponentFixture<WebRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebRatingComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]

    })
    .compileComponents();

    fixture = TestBed.createComponent(WebRatingComponent);
    const context=new XtBaseContext('FULL_VIEW');
    context.setDisplayValue(4);
    fixture.componentRef.setInput('context', context);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
