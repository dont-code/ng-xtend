import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectLoadComponent } from './project-load.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

describe('ProjectLoadComponent', () => {
  let component: ProjectLoadComponent;
  let fixture: ComponentFixture<ProjectLoadComponent>;

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

const PRJ_DEFINITION={
  "name": "Simple",
  "template": false,
  "description": "Simple project with no need for plugins",
  "content": {
    "creation": {
      "type": "Application",
      "name": "Simple",
      "entities": [
        {
          "from": "",
          "name": "SimpleNote",
          "fields": [
            {
              "name": "Text",
              "type": "string"
            },
            {
              "name": "Amount",
              "type": "number"
            },
            {
              "name": "Check",
              "type": "boolean"
            }
          ]
        }
      ],
      "sharing": {
        "with": "Dont-code users"
      }
    }
  }
}
