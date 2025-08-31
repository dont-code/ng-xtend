import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostMenuComponent } from './host-menu.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { beforeEach, describe, expect, it } from 'vitest';

describe('HostMenuComponent', () => {
  let component: HostMenuComponent;
  let fixture: ComponentFixture<HostMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostMenuComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
