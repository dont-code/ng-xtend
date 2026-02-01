import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dcworkflow } from './dc-workflow';

describe('Dcworkflow', () => {
  let component: Dcworkflow;
  let fixture: ComponentFixture<Dcworkflow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dcworkflow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dcworkflow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
