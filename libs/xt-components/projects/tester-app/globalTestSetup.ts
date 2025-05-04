import { TestProject } from 'vitest/node';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { getTestBed } from '@angular/core/testing';
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';

@NgModule({
  imports: [BrowserDynamicTestingModule],
  providers: [provideExperimentalZonelessChangeDetection()],
})
export class TestingModule {}

export function setupAngularTestBed(project?: TestProject) {
  if (globalThis.ngInitDone!=true) {
    getTestBed().initTestEnvironment(
      [TestingModule],
      platformBrowserDynamicTesting(),
    );
    globalThis.ngInitDone=true;
  }
}

declare global {
  var ngInitDone:boolean
}
