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

  it('should safely switch between different entity types via navigation', async () => {
    resolverService.registerTypes({
      "Author": {
        "name": "string",
        "birthYear": "number"
      },
      "Book": {
        "title": "string",
        "pages": "number"
      }
    });

    await storeTestBed.defineTestDataFor('Author', [
      { name: 'Alice', birthYear: 1980 },
      { name: 'Bob', birthYear: 1990 }
    ]);

    await storeTestBed.defineTestDataFor('Book', [
      { title: 'Book One', pages: 200 },
      { title: 'Book Two', pages: 300 },
      { title: 'Book Three', pages: 150 }
    ]);

    const harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/entity/Author', EntityManagerComponent);
    expect(component).toBeTruthy();
    expect(component.entityName()).toEqual('Author');
    harness.fixture.detectChanges();

    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();

    let listDetailsComp = harness.fixture.debugElement.query(By.directive(ListDetailsComponent));
    expect(listDetailsComp).toBeTruthy();
    let rows = listDetailsComp.queryAll(By.css('tbody > tr'));
    expect(rows).toHaveLength(2);
    expect(rows[0].nativeElement.textContent).toSatisfy(
      (text: string) => text.indexOf('Alice') != -1
    );
    expect(rows[1].nativeElement.textContent).toSatisfy(
      (text: string) => text.indexOf('Bob') != -1
    );

    // Navigate to Book entity
    component = await harness.navigateByUrl('/entity/Book', EntityManagerComponent);
    expect(component.entityName()).toEqual('Book');
    harness.fixture.detectChanges();

    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();
    await harness.fixture.whenStable();

    listDetailsComp = harness.fixture.debugElement.query(By.directive(ListDetailsComponent));
    expect(listDetailsComp).toBeTruthy();
    rows = listDetailsComp.queryAll(By.css('tbody > tr'));
    expect(rows).toHaveLength(3);
    expect(rows.some(r => r.nativeElement.textContent.indexOf('Book One') != -1)).toBe(true);
    expect(rows.some(r => r.nativeElement.textContent.indexOf('Book Two') != -1)).toBe(true);
    expect(rows.some(r => r.nativeElement.textContent.indexOf('Book Three') != -1)).toBe(true);
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
