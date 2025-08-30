import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLoadComponent } from './project-load.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setupAngularTestBed } from '../../../globalTestSetup';

describe('ProjectLoadComponent', () => {
  let component: ProjectLoadComponent;
  let fixture: ComponentFixture<ProjectLoadComponent>;

  beforeAll( () => {
    setupAngularTestBed();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectLoadComponent],
      providers: [provideZonelessChangeDetection(), provideRouter(routes), provideHttpClient(),
        MessageService]
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
