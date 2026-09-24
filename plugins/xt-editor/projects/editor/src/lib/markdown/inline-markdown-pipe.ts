import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inlineMarkdown',
})
export class InlineMarkdownPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if( typeof value === 'string' ) {
      let text = value as string;
      if (text.length>100)
        text=text.substring(0,100); // For inline text, we don't want all the text, just the start
      text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');   // images
      text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');// links -> visible text
      text = text.replace(/^#{1,6}\s*/gm, '');            // headers
      text = text.replace(/^\s*[-*+]\s+/gm, '');          // bullet lists
      text = text.replace(/^\s*\d+[.)]\s+/gm, '');        // numbered lists
      text = text.replace(/^\s*[-*]\s+/gm, '');           // bullets that were bold markers
      text = text.replace(/\*\*([^*]*)\*\*/g, '$1');      // bold
      text = text.replace(/\*([^*]*)\*/g, '$1');          // italic *
      text = text.replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, '$1');   // italic _text_
      text = text.replace(/\s*\n\s*/g, ' ');              // newlines -> spaces
      text = text.replace(/\s{2,}/g, ' ').trim();         // collapse
      if (text.length>57) {
        return text.substring(0,57)+'...';
      }
      return text;
    }
    return null;
  }
}
