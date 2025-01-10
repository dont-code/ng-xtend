import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleHelloComponent } from './sample-hello.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { XtBaseContext } from 'xt-components';

describe('SampleHelloComponent', () => {
  let component: SampleHelloComponent;
  let fixture: ComponentFixture<SampleHelloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleHelloComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleHelloComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('context', new XtBaseContext('FULL_VIEW'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
