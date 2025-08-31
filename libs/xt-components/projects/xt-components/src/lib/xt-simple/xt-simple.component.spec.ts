import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtSimpleComponent } from './xt-simple.component';
import { beforeEach, describe, expect, it } from 'vitest';

describe('XtSimpleComponent', () => {
  let component: XtSimpleComponent;
  let fixture: ComponentFixture<XtSimpleComponent>;

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



