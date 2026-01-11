import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { XtResolverService } from '../angular/xt-resolver.service';
import { updateFormGroupWithValue } from './type-helper';

describe('updateFormGroupWithValue', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [provideZonelessChangeDetection()]
    })
      .compileComponents();

  });


  it('should support no types defined', () => {
    const parentGroup=new FormGroup({});
    const resolver = TestBed.inject(XtResolverService);
    updateFormGroupWithValue(parentGroup, {
      name:'Test',
      cost:{
        amount:234,
        currency:'EUR',
        shop:'CoffeeShop'
      }
    }, "EvaluationTest1", resolver.typeResolver);

    expect(parentGroup.get('name')).toBeDefined();
    const costGroup=parentGroup.get('cost') as unknown as FormGroup;
    expect(costGroup?.controls).toBeDefined();
    expect(costGroup?.controls['amount'].value).toEqual(234);
  });

  it('should support form generation without resolverservice', () => {
    const parentGroup=new FormGroup({});
    updateFormGroupWithValue(parentGroup, {
      name:'Test',
      cost:{
        amount:234,
        currency:'EUR',
        shop:'CoffeeShop'
      }
    });

    expect(parentGroup.get('name')).toBeDefined();
    const costGroup=parentGroup.get('cost') as unknown as FormGroup;
    expect(costGroup?.controls).toBeDefined();
    expect(costGroup?.controls['amount'].value).toEqual(234);
  });

  it('should support described types', () => {
    const parentGroup=new FormGroup({});
    const resolver = TestBed.inject(XtResolverService);
    resolver.registerTypes({
      CoffeeCost2: {
        amount:'number',
        currency:'string',
        shop:'string'
      },
      EvaluationTest2: {
        name:'string',
        cost:'CoffeeCost2'
      }
    });

    updateFormGroupWithValue(parentGroup, {
      _id:'testId',
      name:'Test',
      cost:{
        amount:234,
        currency:'EUR',
        shop:'CoffeeShop'
      }
    }, "EvaluationTest2", resolver.typeResolver);

    expect(parentGroup.get('name')).toBeDefined();
    const costGroup=parentGroup.get('cost') as unknown as FormGroup;
    expect(costGroup?.controls).toBeDefined();
    expect(costGroup?.controls['amount'].value).toEqual(234);
      // Fields that are undeclared should still be in the form. Up to the component to manage it or not
    expect(parentGroup.get('_id')).toBeDefined();
      // But the value remains
    expect((parentGroup.value as any)['_id']).toBe('testId');

    // Should remove _id or any other field if undefined
    updateFormGroupWithValue(parentGroup, {
      name:'Test2',
      cost:{
        amount:24,
        currency:'USD',
        shop:'TestShop'
      }
    }, "EvaluationTest2", resolver.typeResolver);

    expect((parentGroup.value as any)['name']).toEqual('Test2');
    expect((parentGroup.value as any)['_id']).toBeUndefined();
    expect(parentGroup.get('_id')).toBeNull();

    // Should remove controls of the existing group if value is undefined
    updateFormGroupWithValue(parentGroup, {
      name:'Test'
    }, "EvaluationTest2", resolver.typeResolver);

    expect(parentGroup.get('cost')).toBeNull();

  })

  it('should handle missing type', () => {
    const resolver = TestBed.inject(XtResolverService);

    try {
      resolver.registerTypes({
        EvaluationTest4: {
          name: 'string',
          cost: 'missingType2'
        }
      });
      expect(true).toBeFalsy();// We should go there
    } catch (e) {
      // Ok
    }
  });
});
