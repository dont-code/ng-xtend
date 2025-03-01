import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestComponent } from './test.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { registerSamplePlugin, SampleHelloComponent } from 'xt-plugin-sample';
import { XtResolverService } from 'xt-components';
import { By } from '@angular/platform-browser';
import { expect } from '@jest/globals';
import { AutoComplete } from 'primeng/autocomplete';

describe('TestComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let resolverService:XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    resolverService=TestBed.inject(XtResolverService);
    registerSamplePlugin(resolverService);
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hello component', async () => {
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

});
