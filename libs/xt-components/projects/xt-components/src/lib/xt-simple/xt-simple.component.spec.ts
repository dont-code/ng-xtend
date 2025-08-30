import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtSimpleComponent } from './xt-simple.component';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';

describe('XtSimpleComponent', () => {
  let component: XtSimpleComponent;
  let fixture: ComponentFixture<XtSimpleComponent>;

  beforeAll( () => {
    setupAngularTestBed();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtSimpleComponent],
      providers: [provideZonelessChangeDetection()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(XtSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});



