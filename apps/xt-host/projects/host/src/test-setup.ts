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

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

@NgModule({
  imports: [BrowserTestingModule],
  providers: [provideZonelessChangeDetection()],
})
export class TestingModule {}

getTestBed().initTestEnvironment(
  [TestingModule],
  platformBrowserTesting()
);
