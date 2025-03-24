import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityManagerComponent } from './entity-manager.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { routes } from '../app.routes';
import { provideRouter } from '@angular/router';
import { expect } from '@jest/globals';
import { RouterTestingHarness } from '@angular/router/testing';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { XtResolverService } from 'xt-components';
import { StoreTestBed } from 'xt-store';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('EntityManagerComponent', () => {
  let component: EntityManagerComponent;
  let fixture: ComponentFixture<EntityManagerComponent>;
  let storeTestBed: StoreTestBed;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityManagerComponent],
      providers: [provideExperimentalZonelessChangeDetection(), provideRouter(routes), provideNoopAnimations()]
    })
    .compileComponents();

    registerDefaultPlugin(TestBed.inject(XtResolverService));
    storeTestBed = new StoreTestBed();
    storeTestBed.ensureMemoryProviderOnly();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(EntityManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display list of entity',async () => {
    await storeTestBed.defineTestDataFor('Test',[{
      _id:"1",
      testString:'string1',
      testBoolean: false
    }]);

    const harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/entity/'+'Test', EntityManagerComponent);
    expect(component).toBeTruthy();
    expect(component.entityName()).toEqual('Test');
    harness.fixture.detectChanges();

    const debugElement = harness.fixture.debugElement.query(By.directive(EntityManagerComponent));
    expect(debugElement.nativeElement.textContent).toContain( 'string1');
  });
});
