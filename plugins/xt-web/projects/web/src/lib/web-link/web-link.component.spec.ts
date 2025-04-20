import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebLinkComponent } from './web-link.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('WebLinkComponent', () => {
  let component: WebLinkComponent;
  let fixture: ComponentFixture<WebLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebLinkComponent],
      providers: [provideNoopAnimations(), provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
