import { TestProject } from 'vitest/node';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { getTestBed } from '@angular/core/testing';

export function setupAngularTestBed(project?: TestProject) {
  if (globalThis.ngInitDone!=true) {
    getTestBed().initTestEnvironment(
      [BrowserDynamicTestingModule],
      platformBrowserDynamicTesting(),
    );
    globalThis.ngInitDone=true;
  }
}

declare global {
  var ngInitDone:boolean
}
