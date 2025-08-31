import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { XtFormTestComponent } from './xt-form-test.component';
import {provideZonelessChangeDetection} from "@angular/core";

describe('XtFormTestComponent', () => {
  let component: XtFormTestComponent;
  let fixture: ComponentFixture<XtFormTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtFormTestComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XtFormTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
