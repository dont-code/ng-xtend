import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebImageComponent } from './web-image.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { XtBaseContext } from 'xt-components';

describe('WebImageComponent', () => {
  let component: WebImageComponent;
  let fixture: ComponentFixture<WebImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebImageComponent],
      providers: [provideNoopAnimations(), provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebImageComponent);
    const context= new XtBaseContext<string>('FULL_VIEW');
    context.setDisplayValue('https://dont-code.net/assets/images/logos/logo-xtend-angular-red-small.png');
    fixture.componentRef.setInput("context", context);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
