import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyTestComponent } from './hierarchy-test.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';

describe('HierarchyTestComponent', () => {
  let component: HierarchyTestComponent;
  let fixture: ComponentFixture<HierarchyTestComponent>;

  beforeAll( () => {
    setupAngularTestBed();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HierarchyTestComponent],
      providers: [provideZonelessChangeDetection()]
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
