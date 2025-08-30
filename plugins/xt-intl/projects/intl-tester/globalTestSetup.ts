import { TestProject } from 'vitest/node';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser-dynamic/testing';

import { getTestBed } from '@angular/core/testing';
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';

@NgModule({
  imports: [BrowserTestingModule],
  providers: [provideExperimentalZonelessChangeDetection()],
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
