import { describe, expect, it } from 'vitest';
import { DontCodeModelManager } from './dont-code-model-manager';

describe('Model Manager', () => {
  it('should find the element at any position', () => {
    expect(new DontCodeModelManager()).toBeDefined();
  });

});
