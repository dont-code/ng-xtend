import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtFormTestComponent } from './xt-form-test.component';
import {provideExperimentalZonelessChangeDetection} from "@angular/core";

describe('XtFormTestComponent', () => {
  let component: XtFormTestComponent;
  let fixture: ComponentFixture<XtFormTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtFormTestComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
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
