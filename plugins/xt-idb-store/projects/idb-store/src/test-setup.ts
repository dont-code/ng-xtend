import "@angular/compiler";
require ('fake-indexeddb/auto');

import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

import { getTestBed } from '@angular/core/testing';
import { NgModule, provideZonelessChangeDetection } from '@angular/core';


@NgModule({
  imports: [BrowserTestingModule],
  providers: [provideZonelessChangeDetection()],
})
export class TestingModule {}

getTestBed().initTestEnvironment(
  [TestingModule],
  platformBrowserTesting()
);
