import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarouselComponent } from './carousel.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { StoreTestBed } from 'xt-store';
import { XtResolverService, XtUnitTestHelper } from 'xt-components';
import { DcWorkflowModel } from 'dc-workflow';
import { By } from '@angular/platform-browser';
import { Carousel } from 'primeng/carousel';
import { FormGroup } from '@angular/forms';

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

  it('should select element on click', async () => {
    await storeTestBed.defineTestDataFor('CarouselTest', [{
      name: 'Test Book',
      published: new Date(1970,10, 5)
    }, {
      name: 'Another Book',
      published: new Date(2010,7, 15)
    }]);

    fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('config', {
      entity: 'CarouselTest',
      workflow: 'carousel',
      data: { sort: { 'published': 'descending' } },
      selection: { field: { key: 'published', type: 'closest-before' } }
    } as DcWorkflowModel);

    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      const panels = fixture.debugElement.queryAll(By.css('.carousel__panel'));
      return panels.length > 0;
    });

    const panels = fixture.debugElement.queryAll(By.css('.carousel__panel'));
    panels[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.selectedElement()).toBeTruthy();
    expect(component.selectedElement()?.name).toEqual('Another Book');
  });

  it('should show edit button on selected element and enter edit mode', async () => {
    await storeTestBed.defineTestDataFor('CarouselTest', [{
      name: 'Test Book',
      published: new Date(1970,10, 5)
    }, {
      name: 'Another Book',
      published: new Date(2010,7, 15)
    }]);

    fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('config', {
      entity: 'CarouselTest',
      workflow: 'carousel',
      data: { sort: { 'published': 'descending' } },
      selection: { field: { key: 'published', type: 'closest-before' } }
    } as DcWorkflowModel);

    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      return fixture.debugElement.queryAll(By.css('.carousel__panel')).length > 0;
    });

    const panels = fixture.debugElement.queryAll(By.css('.carousel__panel'));
    panels[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      return fixture.debugElement.query(By.css('.carousel__edit-btn')) != null;
    });

    const editBtn = fixture.debugElement.query(By.css('.carousel__edit-btn'));
    expect(editBtn).toBeTruthy();

    editBtn.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect((component as any).editingEntity()).toBeTruthy();
    expect((component as any).editingEntity()).toEqual(component.selectedElement());

    const saveBtn = fixture.debugElement.query(By.css('.carousel__actions p-button'));
    expect(saveBtn).toBeTruthy();
  });

  it('should cancel edit mode', async () => {
    await storeTestBed.defineTestDataFor('CarouselTest', [{
      name: 'Test Book',
      published: new Date(1970,10, 5)
    }, {
      name: 'Another Book',
      published: new Date(2010,7, 15)
    }]);

    fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('config', {
      entity: 'CarouselTest',
      workflow: 'carousel',
      data: { sort: { 'published': 'descending' } },
      selection: { field: { key: 'published', type: 'closest-before' } }
    } as DcWorkflowModel);

    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      return fixture.debugElement.queryAll(By.css('.carousel__panel')).length > 0;
    });

    const panels = fixture.debugElement.queryAll(By.css('.carousel__panel'));
    panels[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      return fixture.debugElement.query(By.css('.carousel__edit-btn')) != null;
    });

    const editBtn = fixture.debugElement.query(By.css('.carousel__edit-btn'));
    editBtn.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect((component as any).editingEntity()).toBeTruthy();

    component.cancelEdit();
    fixture.detectChanges();

    expect((component as any).editingEntity()).toBeNull();
    expect((component as any).canSave()).toBeFalsy();
  });

  it('should modify form and enable save', async () => {
    await storeTestBed.defineTestDataFor('CarouselTest', [{
      name: 'Test Book',
      published: new Date(1970,10, 5)
    }]);

    fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('config', {
      entity: 'CarouselTest',
      workflow: 'carousel'
    } as DcWorkflowModel);

    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      return fixture.debugElement.queryAll(By.css('.carousel__panel')).length > 0;
    });

    const panels = fixture.debugElement.queryAll(By.css('.carousel__panel'));
    panels[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      return fixture.debugElement.query(By.css('.carousel__edit-btn')) != null;
    });

    const editBtn = fixture.debugElement.query(By.css('.carousel__edit-btn'));
    editBtn.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect((component as any).editingEntity()).toBeTruthy();
    expect((component as any).editForm()).toBeTruthy();

    const editorForm = (component as any).editForm().get('editor') as FormGroup;
    expect(editorForm).toBeTruthy();
    expect(editorForm.contains('name')).toBeTruthy();

    editorForm.get('name')?.setValue('Modified Book');
    editorForm.markAsDirty();
    fixture.detectChanges();

    expect((component as any).canSave()).toBeTruthy();
  });

  it('should save entity after edit', async () => {
    await storeTestBed.defineTestDataFor('CarouselTest', [{
      name: 'Test Book',
      published: new Date(1970,10, 5)
    }]);

    fixture = TestBed.createComponent(CarouselComponent);
    fixture.componentRef.setInput('config', {
      entity: 'CarouselTest',
      workflow: 'carousel'
    } as DcWorkflowModel);

    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      return fixture.debugElement.queryAll(By.css('.carousel__panel')).length > 0;
    });

    const panels = fixture.debugElement.queryAll(By.css('.carousel__panel'));
    panels[0].nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    await XtUnitTestHelper.waitFor(() => {
      return fixture.debugElement.query(By.css('.carousel__edit-btn')) != null;
    });

    const editBtn = fixture.debugElement.query(By.css('.carousel__edit-btn'));
    editBtn.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const editorForm = (component as any).editForm().get('editor') as FormGroup;
    editorForm.get('name')?.setValue('Updated Book');
    editorForm.markAsDirty();
    fixture.detectChanges();

    expect((component as any).canSave()).toBeTruthy();

    await component.saveEdit();
    fixture.detectChanges();
    await fixture.whenStable();

    expect((component as any).editingEntity()).toBeNull();

    const updated = (component as any).safeFindStore().entities().find((e: any) => e.name === 'Updated Book');
    expect(updated).toBeTruthy();
  });
});
