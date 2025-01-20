import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestObjectComponent } from './test-object.component';

describe('TestObjectComponent', () => {
  let component: TestObjectComponent;
  let fixture: ComponentFixture<TestObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestObjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
