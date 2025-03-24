import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostMenuComponent } from './host-menu.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('HostMenuComponent', () => {
  let component: HostMenuComponent;
  let fixture: ComponentFixture<HostMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostMenuComponent],
      providers: [provideExperimentalZonelessChangeDetection(), provideNoopAnimations()]
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
