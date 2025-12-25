import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { registerAgendaPlugin } from '../../../../agenda/src/lib/register';
import { XtResolverService } from 'xt-components';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { AgendaTestComponent } from './agenda-test.component';

describe('TestComponent', () => {
  let component: AgendaTestComponent;
  let fixture: ComponentFixture<AgendaTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaTestComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]
    })
    .compileComponents();

    const resolver = TestBed.inject(XtResolverService);
    registerDefaultPlugin(resolver);
    resolver.registerTypes({image:'string'});
    registerAgendaPlugin(resolver);
    fixture = TestBed.createComponent(AgendaTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
