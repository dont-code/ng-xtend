import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLoadComponent } from './project-load.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { provideHttpClient } from '@angular/common/http';

describe('ProjectLoadComponent', () => {
  let component: ProjectLoadComponent;
  let fixture: ComponentFixture<ProjectLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectLoadComponent],
      providers: [provideExperimentalZonelessChangeDetection(), provideRouter(routes), provideHttpClient()]
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
