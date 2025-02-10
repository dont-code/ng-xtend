import { getTestBed } from "@angular/core/testing"
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from "@angular/platform-browser-dynamic/testing"

import "fake-indexeddb/auto";
import 'core-js/stable/structured-clone'; // Some bugs in Jest disable the native call

const testEnvironmentOptions =
  (globalThis as any).ngJest?.testEnvironmentOptions ?? Object.create(null)

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  testEnvironmentOptions,
)
