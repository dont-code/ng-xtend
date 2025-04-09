import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyTestComponent } from './hierarchy-test.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('HierarchyTestComponent', () => {
  let component: HierarchyTestComponent;
  let fixture: ComponentFixture<HierarchyTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HierarchyTestComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HierarchyTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
