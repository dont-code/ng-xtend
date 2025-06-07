import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebRatingComponent } from './web-rating.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { setupAngularTestBed } from '../../../globalTestSetup';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('WebRatingComponent', () => {
  let component: WebRatingComponent;
  let fixture: ComponentFixture<WebRatingComponent>;

  beforeAll(() => {
    setupAngularTestBed();
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebRatingComponent],
      providers: [provideNoopAnimations(), provideExperimentalZonelessChangeDetection()]

    })
    .compileComponents();

    fixture = TestBed.createComponent(WebRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
