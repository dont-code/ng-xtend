import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { HostTestFormComponent, XtBaseContext } from 'xt-components';
import { EditorComponent } from './editor.component';
import { By } from '@angular/platform-browser';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]

    })
    .compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(EditorComponent);
    const context=new XtBaseContext('FULL_VIEW');
    context.setDisplayValue("My Text to display");
    fixture.componentRef.setInput('context', context);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show editor in form', () => {
    const hostFixture = TestBed.createComponent(HostTestFormComponent);
    hostFixture.componentRef.setInput('type', EditorComponent);
    hostFixture.componentRef.setInput('formDescription', {
      testText: 'My text to edit'
    });
    hostFixture.componentRef.setInput('controlName', 'testText');
    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    const componentDebug = hostFixture.debugElement.query(By.directive(EditorComponent));
    component=componentDebug.componentInstance;
    expect(component).toBeTruthy();
  });

});
