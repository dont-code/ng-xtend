import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityManagerComponent } from './entity-manager.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { routes } from '../app.routes';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { RouterTestingHarness } from '@angular/router/testing';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { XtResolverService, XtUnitTestHelper } from 'xt-components';
import { StoreTestBed } from 'xt-store';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { WfwRender } from 'dc-workflow';
import { ListDetailsComponent, registerWorkflowPlugin } from 'xt-plugin-workflow';

describe('EntityManagerComponent', () => {
  let component: EntityManagerComponent;
  let fixture: ComponentFixture<EntityManagerComponent>;
  let storeTestBed: StoreTestBed;
  let resolverService: XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityManagerComponent],
      providers: [provideZonelessChangeDetection(), provideRouter(routes), provideNoopAnimations(), MessageService]
    })
    .compileComponents();

    resolverService=TestBed.inject(XtResolverService);
    registerDefaultPlugin(resolverService);
    registerWorkflowPlugin(resolverService);
    storeTestBed = new StoreTestBed();
    StoreTestBed.ensureMemoryProviderOnly();
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

    let debugElement = harness.fixture.debugElement.query(By.directive(WfwRender));
    expect(debugElement).toBeTruthy();

/*    await XtUnitTestHelper.waitFor(() => {
      const comp=harness.fixture.debugElement.query(By.directive(ListDetailsComponent));
      return comp!=null;
    });*/
    debugElement=harness.fixture.debugElement.query(By.directive(ListDetailsComponent));
    expect(debugElement.nativeElement.textContent).toContain( 'string1');
  });

});
