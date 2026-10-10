import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { marked } from 'marked';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
})
export class MarkdownPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {
  }
  transform(value: unknown, ...args: unknown[]): unknown {
    if( typeof value === 'string' ) {
      const html= marked.parse(value.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,""),
        {
          async:false
        });
      return this.sanitizer.sanitize(SecurityContext.HTML, html);
    }
    return null;
  }
}
