import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultComponent } from './default.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('DefaultComponent', () => {
  let component: DefaultComponent;
  let fixture: ComponentFixture<DefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultComponent],
      providers: [provideExperimentalZonelessChangeDetection()]

    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
