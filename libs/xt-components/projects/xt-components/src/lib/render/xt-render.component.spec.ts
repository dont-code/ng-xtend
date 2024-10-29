import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtRenderComponent } from './xt-render.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('XtRenderComponent', () => {
  let component: XtRenderComponent;
  let fixture: ComponentFixture<XtRenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtRenderComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XtRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
