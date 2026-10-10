import { describe, expect, it } from 'vitest';
import { InlineMarkdownPipe } from './inline-markdown-pipe';

describe('InlineMarkdownPipe', () => {
  it('create an instance', () => {
    const pipe = new InlineMarkdownPipe();
    expect(pipe).toBeTruthy();
  });

  it('extract text from markdown', () => {
    const pipe = new InlineMarkdownPipe();
    const resp = pipe.transform("# Header\n\n**Simple** Text") as string;

    expect(resp).toBe('Header Simple Text');
  });

  it('supports long markdown', () => {
    const pipe = new InlineMarkdownPipe();
    const resp = pipe.transform("# Header 1\n\n## Header 1.1\n\n**Simple** Text\n\n- List Item 1\n- List Item 2\n\n## Header 1.2\n\nVery long text that should be clipped.") as string;

    expect(resp.indexOf('clipped')).toBe(-1);
    expect(resp.indexOf('List Item 1')).not.toBe(-1);
    expect(resp.endsWith('...')).toBeTruthy();
  });
});
