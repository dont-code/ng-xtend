import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselComponent } from './carousel.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { StoreTestBed } from 'xt-store';
import { XtResolverService, XtUnitTestHelper } from 'xt-components';
import { DcWorkflowModel } from 'dc-workflow';
import { By } from '@angular/platform-browser';
import { Carousel } from 'primeng/carousel';

describe('Carousel Component', () => {
  let component: CarouselComponent<any>;
  let fixture: ComponentFixture<CarouselComponent<any>>;
  let storeTestBed: StoreTestBed;
  let resolver: XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselComponent],
    }).compileComponents();

    registerDefaultPlugin(TestBed.inject(XtResolverService));
    storeTestBed = new StoreTestBed();
    StoreTestBed.ensureMemoryProviderOnly();

  });

  it('should create', async () => {
    fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('config',{});
    component = fixture.componentInstance;
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });

  it ('should display carousel', async () => {

    await storeTestBed.defineTestDataFor('CarouselTest', [{
      name: 'Test Book',
      published: new Date(1970,10, 5)
    }, {
      name: 'Another Book',
      published: new Date(2010,7, 15)
    }
    ]);

    fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput ('config', {
      entity: 'CarouselTest',
      workflow: 'carousel',
      data: {
        sort: {
          'published':'descending'
        }
      },
      selection: {
        field: {
          key: 'published',
          type: 'closest-before'
        }
      }
    } as DcWorkflowModel);

    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      const carouselComponent = fixture.debugElement.query(By.directive(Carousel));
      return carouselComponent != null;
    });

    let carouselComponent = fixture.debugElement.query(By.directive(Carousel));
    expect(carouselComponent).toBeTruthy();

    expect(carouselComponent.nativeElement.textContent?.indexOf('Another Book')).not.toBe(-1);
  });
});
