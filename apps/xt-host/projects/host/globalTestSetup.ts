import { TestProject } from 'vitest/node';

import { getTestBed } from '@angular/core/testing';
import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

@NgModule({
  imports: [BrowserTestingModule],
  providers: [provideZonelessChangeDetection()],
})
export class TestingModule {}

export function setupAngularTestBed(project?: TestProject) {
  if (globalThis.ngInitDone!=true) {
    getTestBed().initTestEnvironment(
      [TestingModule],
      platformBrowserTesting(),
    );
    globalThis.ngInitDone=true;
  }
}

declare global {
  var ngInitDone:boolean
}
