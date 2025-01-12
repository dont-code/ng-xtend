import { TestBed } from '@angular/core/testing';

import { DefaultObjectComponent } from './default-object.component';
import { XtBaseContext } from 'xt-components';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('DefaultObjectComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultObjectComponent],
      providers:[provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DefaultObjectComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    const context= new XtBaseContext<string>('FULL_VIEW');
    context.setDisplayValue("");
    fixture.componentRef.setInput('context', context);

    expect(component).toBeTruthy();
  });
});
