import { describe, expect, it } from 'vitest';
import { SpecialFields } from './special-fields';
import { XtSpecialFieldsHelper } from './xt-special-fields-helper.ts';
import { xtTypeManager } from '../globals.ts';
import { XtTypeHierarchy } from '../resolver/xt-type-resolver.ts';

describe('Special fields helper', () => {
  it ('should update special fields', () => {
    let fields=new SpecialFields();
    xtTypeManager().addRootType("Test Type", {
      name: 'string',
      id: 'string',
      on: 'date',
      value: 'number'
    });
    fields = XtSpecialFieldsHelper.findSpecialFields("Test Type", xtTypeManager().findType('Test Type') as XtTypeHierarchy, fields);

    expect(fields.idField).toBe('id');
    expect(fields.numericValueField).toBe('value');
    expect(fields.displayTemplate).toBeDefined();
    expect(fields.dateFields![0]).toBe('on');

  })
})
