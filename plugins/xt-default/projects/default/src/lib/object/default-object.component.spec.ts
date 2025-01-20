import { TestBed } from '@angular/core/testing';

import { DefaultObjectComponent } from './default-object.component';
import { HostTestTypedFormComponent, XtBaseContext, XtResolverService } from 'xt-components';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { registerDefaultPlugin } from '../register';
import { By } from '@angular/platform-browser';
import { expect } from '@jest/globals';

describe('DefaultObjectComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultObjectComponent],
      providers:[provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    registerDefaultPlugin(TestBed.inject(XtResolverService));
  });

  it('should display complex type', () => {
    const fixture = TestBed.createComponent(DefaultObjectComponent);
    const component = fixture.componentInstance;
    const context= new XtBaseContext<any>('FULL_VIEW');
    context.setDisplayValue({
      test1: 'value1',
      test2: {
        test21: 'value21',
        test22: new Date(),
        test23: true
      }
    });
    fixture.componentRef.setInput('context', context);

    fixture.detectChanges();
    expect(component).toBeTruthy();

    expect (fixture.nativeElement.textContent).toContain('test22:');
  });

  it('should edit complex type', () => {
    const hostFixture = TestBed.createComponent(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      test1: 'value1',
      test2: {
        test21: 'value21',
        test22: new Date(),
        test23: true
      }
    });
    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const objectComponent = hostFixture.debugElement.query(By.directive(DefaultObjectComponent));
    expect(objectComponent).toBeTruthy();

    const test21Input = objectComponent.query(By.css('input[name="test21"]'));
    expect (test21Input.nativeElement.value).toBe('value21');

    const test23Check = objectComponent.query(By.css('input[name="test23"]'));
    expect(test23Check.attributes['type']).toBe('checkbox');

  });

});
