import "@angular/compiler";

import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

import { getTestBed } from '@angular/core/testing';
import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(class {
  disconnect = () => {};
  observe = (target: Element, options?: ResizeObserverOptions) => {
  };
  unobserve = (target: Element)=> {
  };
});

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

@NgModule({
  imports: [BrowserTestingModule],
  providers: [provideZonelessChangeDetection()],
})
export class TestingModule {}

getTestBed().initTestEnvironment(
  [TestingModule],
  platformBrowserTesting()
);
