import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtOtherComponent } from './xt-other.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
