import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtOtherComponent } from './xt-other.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { XtBaseContext } from 'xt-components';

describe('XtOtherComponent', () => {
  let component: XtOtherComponent;
  let fixture: ComponentFixture<XtOtherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtOtherComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XtOtherComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('context', new XtBaseContext('FULL_VIEW'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
