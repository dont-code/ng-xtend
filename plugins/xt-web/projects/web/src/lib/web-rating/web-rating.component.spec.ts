import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebRatingComponent } from './web-rating.component';
import { RatingTypeHandler } from './rating-type-handler';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { StoreTestHelper, XtBaseContext, XtResolverService } from 'xt-components';
import { registerWebPlugin } from '../register';

describe('WebRatingComponent', () => {
  let component: WebRatingComponent;
  let fixture: ComponentFixture<WebRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebRatingComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]

    })
    .compileComponents();

    StoreTestHelper.ensureTestProviderOnly();

    fixture = TestBed.createComponent(WebRatingComponent);
    const context=new XtBaseContext('FULL_VIEW');
    context.setDisplayValue(4);
    fixture.componentRef.setInput('context', context);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be sortable through its type handler', () => {
    const resolverService = TestBed.inject(XtResolverService);
    registerWebPlugin(resolverService);

    const found = resolverService.typeResolver.findTypeHandler('rating');
    expect(found.typeName).toEqual('number');
    const handler = found.handler!;
    expect(handler).toBeInstanceOf(RatingTypeHandler);
    expect(handler.isSortable()).toBe(true);
    expect(handler.createNew()).toBe(1);

    expect(handler.compareTo(3, 5)).toBeLessThan(0);
    expect(handler.compareTo(5, 3)).toBeGreaterThan(0);
    expect(handler.compareTo(4, 4)).toBe(0);

    const ratings = [4, 2, 5, 1, 3];
    const sorted = [...ratings].sort((a, b) => handler.compareTo(a, b));
    expect(sorted).toEqual([1, 2, 3, 4, 5]);
  });

  it('should keep the rating handler sortable when used as a child type', () => {
    const resolverService = TestBed.inject(XtResolverService);
    registerWebPlugin(resolverService);
    resolverService.registerTypes({
      movieType: {
        title: 'string',
        rating: 'rating'
      }
    });

    const found = resolverService.typeResolver.findTypeHandler('movieType', false, 'rating');
    expect(found.typeName).toEqual('number');
    expect(found.handler?.isSortable()).toBe(true);
    expect(found.handler?.compareTo(2, 5)).toBeLessThan(0);
  });
});
