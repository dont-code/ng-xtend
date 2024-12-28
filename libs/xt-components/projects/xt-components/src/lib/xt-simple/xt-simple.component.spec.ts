import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtSimpleComponent } from './xt-simple.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

describe('XtSimpleComponent', () => {
  let component: XtSimpleComponent;
  let fixture: ComponentFixture<XtSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtSimpleComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
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



