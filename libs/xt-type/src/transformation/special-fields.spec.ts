import { describe, expect, it } from 'vitest';
import { SpecialFields } from './special-fields';

describe('Special fields', () => {
  it ('should be defined', () => {
    expect(new SpecialFields()).toBeDefined();
  })
  it ('should not escape char', () => {
    const specialFields=new SpecialFields();
    specialFields.setDisplayTemplate('<%=it.toDisplay%>');

    const result = specialFields.runDisplayTemplate({
      toDisplay:'special chars < >'
    });

    expect(result).toBe('special chars < >');
  })
})
