import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLoadComponent } from './project-load.component';

describe('ProjectLoadComponent', () => {
  let component: ProjectLoadComponent;
  let fixture: ComponentFixture<ProjectLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectLoadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
