import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestConfigureComponent } from './test-configure.component';

describe('TestConfigure', () => {
  let component: TestConfigureComponent;
  let fixture: ComponentFixture<TestConfigureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestConfigureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestConfigureComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
