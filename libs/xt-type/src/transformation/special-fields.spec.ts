import { describe, expect, it } from 'vitest';
import { SpecialFields } from './special-fields';

describe('Special fields', () => {
  it ('should be defined', () => {
    expect(new SpecialFields()).toBeDefined();
  })
})
