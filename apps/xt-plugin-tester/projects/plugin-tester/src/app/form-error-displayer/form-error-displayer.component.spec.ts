import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormErrorDisplayerComponent } from './form-error-displayer.component';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';
import { FormGroup } from '@angular/forms';

describe('FormErrorDisplayerComponent', () => {
  let component: FormErrorDisplayerComponent;
  let fixture: ComponentFixture<FormErrorDisplayerComponent>;
  beforeAll( () => {
    setupAngularTestBed();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorDisplayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormErrorDisplayerComponent);
    fixture.componentRef.setInput("form", new FormGroup({}));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
