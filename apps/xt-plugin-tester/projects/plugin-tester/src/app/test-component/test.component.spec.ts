import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestComponent } from './test.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { XtResolverService, XtSimpleComponent } from 'xt-components';
import { By } from '@angular/platform-browser';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AutoComplete } from 'primeng/autocomplete';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { provideRouter } from '@angular/router';

describe('TestComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let resolverService:XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations(), MessageService, provideRouter([])]
    })
    .compileComponents();

    resolverService=TestBed.inject(XtResolverService);
//    registerSamplePlugin(resolverService);
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose a fresh, filtered suggestion array on each search', () => {
    resolverService.registerPlugin({
      name: 'TestPlugin9',
      components: [
        {
          componentName: 'TestComponent91',
          componentClass: XtSimpleComponent,
          typesHandled: ['TestType91'],
        },
        {
          componentName: 'TestComponent92',
          componentClass: XtSimpleComponent,
          typesHandled: ['TestType92'],
        },
      ],
      types: {
        TestType91: 'string',
        TestType92: 'string',
      },
    });
    fixture.detectChanges();

    // PrimeNG's AutoComplete only clears its internal loading state when the
    // `suggestions` reference changes, so each search MUST produce a new array.
    component.completeName({ query: '' });
    const first = component.suggestions();
    expect(first.length).toBeGreaterThan(0);

    component.completeName({ query: '' });
    const second = component.suggestions();
    expect(second).not.toBe(first);
    expect(second).toEqual(first);

    // Filtering is applied.
    component.completeName({ query: 'TestComponent91' });
    expect(component.suggestions()[0]?.items).toHaveLength(1);

    component.completeName({ query: 'no-such-component' });
    expect(component.suggestions()).toHaveLength(0);
  });

  /**it('should display hello component', async () => {
    expect(component.suggestedComponents()).toHaveLength(3);

    const componentSelect = fixture.debugElement.query(By.directive(AutoComplete));
    expect(componentSelect).toBeTruthy();

    component.component.set(resolverService.pluginRegistry.componentRegistry.get('SampleHello')??null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.componentValid()).toBeTruthy();
    const fullViewOther=fixture.debugElement.query(By.css('#fullView')).query(By.directive(SampleHelloComponent));
    expect(fullViewOther).toBeTruthy();


    expect(fullViewOther.nativeElement.textContent).toContain('Hello ');
   });
*/
});
