import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { XtResolverService } from 'xt-components';
import { Button } from 'primeng/button';
import { DcWorkflowModel, WfwRender } from 'dc-workflow';
import { StoreTestBed } from 'xt-store';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-test',
  imports: [
    ReactiveFormsModule,
    Button,
    WfwRender,
    NgClass
  ],
  templateUrl: './test-workflow.component.html',
  styleUrl: './test-workflow.component.css'
})
export class TestWorkflowComponent implements OnInit, OnDestroy {

  protected resolver = inject(XtResolverService);
  protected builder = inject(FormBuilder);

dataLoaded = signal<boolean>(false);

  protected subscriptions= new Subscription();

  /** The entity type currently tested ('test' = simple, 'complex' = many fields) */
  protected entityType = signal<string>('test');

  constructor() {
    this.resolver.registerTypes({
      test: {
        name: 'string',
        creationDate: 'date',
        value: 'number'
      },
      complex: {
        name: 'string',
        creationDate: 'date',
        value: 'number',
        description: 'string',
        notes: 'string',
        category: 'string',
        reference: 'string',
        active: 'boolean',
        featured: 'boolean',
        quantity: 'number',
        price: 'number',
        weight: 'number',
        rating: 'number',
        releaseDate: 'date',
        updatedDate: 'date'
      }
    });
  }

  ngOnInit(): void {
    const storeTestBed = new StoreTestBed();
    storeTestBed.defineTestDataFor('test', [{
      name:'Test1',
      creationDate:new Date(2024,3,4),
      value: 12
    },{
      name:'ATest2',
      creationDate:new Date(2014,6,23),
      value: 22
    },{
      name:'Other Test',
      creationDate:new Date(2026,4,19),
      value: 34
    },{
      name:'Random Test',
      creationDate:new Date(2025,10,9),
      value: 4
    },{
      name:'New value Test',
      creationDate:new Date(2016,8,1),
      value: 64
    },{
      name:'Value Test',
      creationDate:new Date(2028,11,23),
      value: 34
    }])
      .then(() => storeTestBed.defineTestDataFor('complex', this.buildComplexTestData()))
      .then(() => {
        this.dataLoaded.set(true);
      });
  }

  protected buildComplexTestData(): any[] {
    const description =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.';
    const notes =
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    const base = {
      name: '',
      creationDate: new Date(2024, 0, 1),
      value: 0,
      description,
      notes,
      category: 'Alpha',
      reference: 'REF-UNK',
      active: true,
      featured: false,
      quantity: 1,
      price: 0,
      weight: 0,
      rating: 3,
      releaseDate: new Date(2023, 5, 15),
      updatedDate: new Date(2024, 11, 31)
    };
    const rows = [
      { name: 'Complex One', value: 12, category: 'Alpha', reference: 'REF-10', active: true, featured: true, quantity: 2, price: 129.99, weight: 1.25, rating: 5 },
      { name: 'Complex Two', creationDate: new Date(2022, 6, 30), value: 45, category: 'Beta', reference: 'REF-20', active: true, featured: false, quantity: 8, price: 9.5, weight: 0.4, rating: 4 },
      { name: 'Complex Three', creationDate: new Date(2020, 2, 14), value: 7, category: 'Gamma', reference: 'REF-30', active: false, featured: false, quantity: 0, price: 249, weight: 3.7, rating: 2 },
      { name: 'Complex Four', creationDate: new Date(2025, 8, 2), value: 89, category: 'Alpha', reference: 'REF-40', active: true, featured: true, quantity: 5, price: 59.99, weight: 0.8, rating: 4 },
      { name: 'Complex Five', creationDate: new Date(2018, 10, 9), value: 23, category: 'Delta', reference: 'REF-50', active: false, featured: false, quantity: 12, price: 14.25, weight: 2.1, rating: 3 },
      { name: 'Complex Six', creationDate: new Date(2026, 1, 19), value: 156, category: 'Beta', reference: 'REF-60', active: true, featured: false, quantity: 3, price: 399, weight: 5.6, rating: 5 }
    ];
    return rows.map(row => ({ ...base, ...row }));
  }

  protected sortField = signal<string>('name');
  protected sortDir = signal<'ascending' | 'descending'>('ascending');

  protected workflowConfig = computed<DcWorkflowModel>(() => ({
    entity:this.entityType(),
    workflow:this.workflowType() as 'list-detail'|'carousel',
    data: {
      sort: {
        [this.sortField()]: this.sortDir()
      }
    }
  }));

  protected workflowType = signal<string>('list-detail');

  protected setEntityType(value: string) {
    this.entityType.set(value);
  }

  protected toggleSort(field: string) {
    if (this.sortField() === field) {
      this.sortDir.update(d => d === 'ascending' ? 'descending' : 'ascending');
    } else {
      this.sortField.set(field);
      this.sortDir.set('ascending');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected setWorkflowType(value: string) {
    this.workflowType.set(value);
  }

  protected flexForCarouselOnly = computed( () =>{
    if (this.workflowType()=='carousel') {
      return 'flex';
    }
    return undefined;
  });
}
