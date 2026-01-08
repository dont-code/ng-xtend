import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { XtBaseContext } from './xt-context';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

describe('XtContext', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDummyComponent],
      providers: [provideZonelessChangeDetection()]
    })
      .compileComponents();

  });


  it('should calculate isInForm correctly', () => {
    let context= new XtBaseContext('FULL_VIEW');
    expect(context.isInForm()).toBe(false);

    context = new XtBaseContext('FULL_EDITABLE', undefined, undefined);
    expect(context.isInForm()).toBe(false);

    context = new XtBaseContext('FULL_EDITABLE', undefined, new FormGroup([]));
    expect(context.isInForm()).toBe(true);

    context = new XtBaseContext('FULL_EDITABLE', 'test', new FormGroup({test: new FormControl('')}));
    expect(context.isInForm()).toBe(true);
  });


  it('should calculate subContext correctly', () => {
    let context= new XtBaseContext('FULL_VIEW');
    context.setDisplayValue({sub1:'Sub1', sub2:null});
    expect(context.subValue('sub1')).toBe('Sub1');
    expect(context.subValue('sub2')).toBeNull();

    let sub1 = context.subContext('sub1');
    expect(sub1.displayValue()).toBe('Sub1');
    expect(sub1.subName).toBe('sub1');
    sub1.setDisplayValue('newSub1');
    expect (context.displayValue()).toStrictEqual({sub1:'newSub1', sub2:null});

    let sub2 = context.subContext('sub2');
    expect(sub2.displayValue()).toBeNull();
    expect(sub2.subName).toBe('sub2');

    sub2.setDisplayValue('Sub2');

    expect (context.displayValue()).toStrictEqual({sub1:'newSub1', sub2:'Sub2'});

    context.setDisplayValue({sub1:'newNewSub1',sub2:'newSub2'});
    expect (sub1.value()).toBe('newNewSub1');
    expect (sub2.value()).toBe('newSub2');
  });

});


/**
 * It seems like for the test with ReactiveForm to work properly, one need to create a dummy component
 *
 */
@Component({
  selector: 'test-dummy-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: 'Empty Test'
})
export class TestDummyComponent {

}
