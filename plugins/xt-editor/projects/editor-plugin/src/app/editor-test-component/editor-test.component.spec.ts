import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { registerEditorPlugin } from '../../../../editor/src/lib/register';
import { XtResolverService } from 'xt-components';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { registerDefaultPlugin } from 'xt-plugin-default';
import { EditorTestComponent } from './editor-test.component';

describe('EditorTestComponent', () => {
  let component: EditorTestComponent;
  let fixture: ComponentFixture<EditorTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorTestComponent],
      providers: [provideNoopAnimations(), provideZonelessChangeDetection()]
    })
    .compileComponents();

    const resolver = TestBed.inject(XtResolverService);
    registerDefaultPlugin(resolver);
    registerEditorPlugin(resolver);
    fixture = TestBed.createComponent(EditorTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
