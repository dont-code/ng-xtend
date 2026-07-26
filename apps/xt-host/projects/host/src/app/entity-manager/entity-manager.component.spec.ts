import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityManagerComponent } from './entity-manager.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { routes } from '../app.routes';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { RouterTestingHarness } from '@angular/router/testing';
import { CarouselObjectSetComponent, registerDefaultPlugin } from 'xt-plugin-default';
import { XtResolverService, XtUnitTestHelper } from 'xt-components';
import { StoreTestBed } from 'xt-store';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { WfwRender } from 'dc-workflow';
import { ListDetailsComponent, registerWorkflowPlugin } from 'xt-plugin-workflow';
import { DcApplicationModel } from '../shared/models/dc-application-model';
import { ApplicationModelManagerService } from '../application-model-manager/application-model-manager.service';

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

  it('should display correct carousel when switching between two entities with carousel workflows', async () => {
    const appModelMgr = TestBed.inject(ApplicationModelManagerService);

    const testModel: DcApplicationModel = {
      name: 'Carousel Test',
      content: {
        creation: {
          entities: [
            {
              name: 'Movie',
              fields: [
                { name: 'title', type: 'string' },
                { name: 'year', type: 'number' }
              ]
            },
            {
              name: 'Actor',
              fields: [
                { name: 'name', type: 'string' },
                { name: 'age', type: 'number' }
              ]
            }
          ],
          workflows: {
            'MovieCarousel': {
              entity: 'Movie',
              workflow: 'carousel'
            },
            'ActorCarousel': {
              entity: 'Actor',
              workflow: 'carousel'
            }
          }
        }
      }
    };

    appModelMgr.setModel(testModel);
    resolverService.registerTypes(appModelMgr.getApplicationTypes() ?? undefined);

    await storeTestBed.defineTestDataFor('Movie', [
      { title: 'Inception', year: 2010 },
      { title: 'The Matrix', year: 1999 }
    ]);

    await storeTestBed.defineTestDataFor('Actor', [
      { name: 'Leonardo DiCaprio', age: 48 },
      { name: 'Keanu Reeves', age: 59 },
      { name: 'Morgan Freeman', age: 86 }
    ]);

    // Navigate to Movie entity
    const harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl('/entity/Movie', EntityManagerComponent);
    expect(component.entityName()).toEqual('Movie');
    harness.fixture.detectChanges();

    await XtUnitTestHelper.waitFor(() => {
      return harness.fixture.debugElement.query(By.directive(CarouselObjectSetComponent)) != null;
    });

    let carouselComp = harness.fixture.debugElement.query(By.directive(CarouselObjectSetComponent));
    expect(carouselComp).toBeTruthy();

    let carouselText = carouselComp.nativeElement.textContent as string;
    expect(carouselText.indexOf('Inception')).not.toBe(-1);
    expect(carouselText.indexOf('The Matrix')).not.toBe(-1);

    // Navigate to Actor entity (simulating left pane menu click)
    component = await harness.navigateByUrl('/entity/Actor', EntityManagerComponent);
    expect(component.entityName()).toEqual('Actor');
    harness.fixture.detectChanges();

    await XtUnitTestHelper.waitFor(() => {
      return harness.fixture.debugElement.query(By.directive(CarouselObjectSetComponent)) != null;
    });

    carouselComp = harness.fixture.debugElement.query(By.directive(CarouselObjectSetComponent));
    expect(carouselComp).toBeTruthy();

    carouselText = carouselComp.nativeElement.textContent as string;
    expect(carouselText.indexOf('Leonardo DiCaprio')).not.toBe(-1);
    expect(carouselText.indexOf('Keanu Reeves')).not.toBe(-1);
    // Verify Movie data is NOT present after switching
    expect(carouselText.indexOf('Inception')).toBe(-1);
    expect(carouselText.indexOf('The Matrix')).toBe(-1);
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
