import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginManagerComponent } from './plugin-manager.component';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { XtCompositeComponent, XtResolverService, XtSimpleComponent } from 'xt-components';
import { MessageService } from 'primeng/api';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('PluginManagerComponent', () => {
  let component: PluginManagerComponent;
  let fixture: ComponentFixture<PluginManagerComponent>;
  let resolver: XtResolverService|null=null;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PluginManagerComponent],
      providers: [MessageService, provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    // Avoid httpResource error
    httpTesting = TestBed.inject(HttpTestingController);

    resolver = TestBed.inject(XtResolverService);

    fixture = TestBed.createComponent(PluginManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    httpTesting.expectOne('assets/config/plugin-urls.json').flush({
      test: []
    });
    expect(component).toBeTruthy();
  });

  it('should list plugins', () => {
    httpTesting.expectOne('assets/config/plugin-urls.json').flush({
      test: []
    });
    resolver!.registerPlugin({
      name:'TestPlugin1',
      components: [
        {
          componentName:'TestComponent11',
          componentClass: XtCompositeComponent,
          typesHandled: [
            'TestType11'
          ]
        }
      ],
      types: {
        'TestType11': 'string'
      }
    });
    resolver!.registerPlugin({
      name:'TestPlugin2',
      components: [
        {
          componentName:'TestComponent21',
          componentClass: XtSimpleComponent,
          typesHandled: [
            'TestType21', 'TestType22'
          ]
        },
        {
          componentName:'TestComponent22',
          componentClass: XtSimpleComponent,
          typesHandled: [
            'TestType23'
          ]
        }
      ],
      types: {
        'TestType211': {
          'TestProperty2111':'date',
          'TestProperty2112':'boolean'
        },
        'TestType21': {
          'subProp':'TestType211'
        },
        'TestType22': 'string',
        'TestType23': {
          'TestProperty231':'string',
          'TestProperty232':'date'
        }
      }
    })
    fixture.detectChanges();

    const plugins=component.listPlugins();
    expect(plugins).toHaveLength(2);
    expect(plugins[1].details?.components).toHaveLength(2);
    expect(plugins[1].details?.components[1]?.name).toEqual('TestComponent22');
    expect(plugins[1].details?.components[1]?.className).toBeTruthy();
    expect(plugins[1].details?.types).toHaveLength(4);

  });

});
