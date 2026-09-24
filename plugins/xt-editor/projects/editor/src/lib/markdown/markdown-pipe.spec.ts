import { beforeEach, describe, expect, it } from 'vitest';
import { MarkdownPipe } from './markdown-pipe';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideZonelessChangeDetection } from '@angular/core';

describe('MarkdownPipe', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [MarkdownPipe, provideNoopAnimations(), provideZonelessChangeDetection()]

    })
      .compileComponents();
  });

  it('create an instance', () => {
    const pipe = TestBed.inject(MarkdownPipe);
    expect(pipe).toBeTruthy();
  });

  it('Render correctly HTML', () => {
    const pipe = TestBed.inject(MarkdownPipe);
    const response = pipe.transform("# Header\n\nTest **Text**") as string;
    expect(response.indexOf('<h1>')).not.toBe(-1);
    expect(response.indexOf('Test')).not.toBe(-1);
    expect(response.indexOf('<strong>')).not.toBe(-1);
  });

});
