import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectSetComponent } from './test-object-set.component';

describe('TestObjectSetComponent', () => {
  let component: TestObjectSetComponent;
  let fixture: ComponentFixture<TestObjectSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestObjectSetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestObjectSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
