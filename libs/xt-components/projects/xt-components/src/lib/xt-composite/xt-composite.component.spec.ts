import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XtCompositeComponent } from './xt-composite.component';
import { Component, OnInit, provideZonelessChangeDetection } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { XtBaseContext } from '../xt-context';
import { beforeEach, describe, expect, it } from 'vitest';

describe('XtCompositeComponent', () => {
  let component: XtCompositeComponent;
  let fixture: ComponentFixture<XtCompositeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XtCompositeComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XtCompositeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ('should support edit managedcontrols', () => {
    const FB = TestBed.inject(FormBuilder);
    const TMCFixture = TestBed.createComponent(TestManagedControlComponent);
    const TMCContext = new XtBaseContext('FULL_EDITABLE', "Test", FB.group({
      Test: FB.group({})
    }));
    TMCFixture.componentRef.setInput("context", TMCContext);
    const TMCComponent = TMCFixture.componentInstance;
    TMCFixture.detectChanges();

    expect(TMCContext.formGroup()?.value).toEqual({ TestManagedControl: null});

    const text = TMCFixture.nativeElement.querySelector ('#text_input') as HTMLInputElement;
    expect (text.value).toEqual("");
    text.value="Third";
    text.dispatchEvent(new Event('input'));
    TMCFixture.detectChanges();

    expect(TMCContext.formGroup()?.value).toEqual({ TestManagedControl: 'Third'});
  });

  it ('should support display managedcontrols', () => {
    const FB = TestBed.inject(FormBuilder);
    const TMCFixture = TestBed.createComponent(TestManagedControlComponent);
    const TMCContext = new XtBaseContext('FULL_VIEW');
    TMCContext.setDisplayValue(null);
    TMCFixture.componentRef.setInput("context", TMCContext);
    const TMCComponent = TMCFixture.componentInstance;
    TMCFixture.detectChanges();

    const text = TMCFixture.nativeElement.querySelector ('h2') as HTMLElement;
    expect (text.textContent).toEqual("Value is ");
    TMCContext.setDisplayValue({TestManagedControl: 'Second'});
    TMCFixture.detectChanges();

    expect(text.textContent).toEqual('Value is Second');
  });

});

@Component({
  selector: 'test-managedcontrol',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: '@if (isInForm()) {<ng-container [formGroup]="formGroup()"><input id="text_input" name="TestManagedControl" type="text" formControlName="TestManagedControl" /></ng-container>} @else {<h2>Value is {{context().displayValue()?.TestManagedControl}}</h2>}'
})
export class TestManagedControlComponent extends XtCompositeComponent<any> implements OnInit {
    override ngOnInit (): void {
      super.ngOnInit();
      this.manageFormControl("TestManagedControl");
    }

}
