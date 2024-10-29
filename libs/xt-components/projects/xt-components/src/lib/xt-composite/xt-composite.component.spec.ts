import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtCompositeComponent } from './xt-composite.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('XtCompositeComponent', () => {
  let component: XtCompositeComponent;
  let fixture: ComponentFixture<XtCompositeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtCompositeComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XtCompositeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
