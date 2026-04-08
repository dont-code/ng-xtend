import { TestBed } from '@angular/core/testing';

import { ApplicationModelManagerService } from './application-model-manager.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { DcApplicationModel, OldDcApplicationModel } from '../shared/models/dc-application-model';
import { XtResolverService } from 'xt-components';
import { isTypeReference, XtTypeHierarchy } from 'xt-type';

describe('ApplicationModelManagerService', () => {
  let service: ApplicationModelManagerService;
  let resolver: XtResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(ApplicationModelManagerService);
    resolver = TestBed.inject(XtResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it ('should read simple project', () => {
    service.setModel(PRJ_SIMPLE_DEFINITION);
    resolver.registerTypes(service.getApplicationTypes()??undefined);
    const simpleNote=resolver.typeResolver.findType('SimpleNote') as XtTypeHierarchy;

    expect(simpleNote.children!['Text'].type).toBe("string");
  });

  it ('should read generated project', () => {
    service.setModel(PRJ_REF_DEFINITION as any);
    resolver.registerTypes({
      'eur-amount':'string',
      'rating':'number'
    });
    resolver.registerTypes(service.getApplicationTypes()??undefined);
    resolver.resolvePendingReferences();
    const visit=resolver.typeResolver.findType('Visit') as XtTypeHierarchy;

    expect(visit.children!['date'].type).toBe("date");

    const refToRestaurant = visit.children!['restaurant'];
    expect(isTypeReference (refToRestaurant)).toBeTruthy();
    if (isTypeReference(refToRestaurant)) {
      expect(refToRestaurant.referenceType).toEqual("MANY-TO-ONE");
      expect(refToRestaurant.type).toEqual("string");
      expect(refToRestaurant.toType).toEqual("Restaurant");
    }
  });

  it ('should read old-format project', () => {
    service.setModel(PRJ_OLD_DEFINITION);
    resolver.registerTypes(service.getApplicationTypes()??undefined);
    const recipe=resolver.typeResolver.findType('Recipe') as XtTypeHierarchy;

    expect(recipe.children!['From'].type).toBe("country");
  });

});


const PRJ_SIMPLE_DEFINITION:DcApplicationModel={
  "name": "Simple",
  "description": "Simple project with no need for plugins",
  "content": {
    "creation": {
      "type": "Application",
      "name": "Simple",
      "entities": [
        {
          "from": "",
          "name": "SimpleNote",
          "fields": [
            {
              "name": "Text",
              "type": "string"
            },
            {
              "name": "Amount",
              "type": "number"
            },
            {
              "name": "Check",
              "type": "boolean"
            }
          ]
        }
      ],
      "sharing": {
        "with": "Dont-code users"
      }
    }
  }
}

const PRJ_REF_DEFINITION=
  {
    name: 'Mexican Food Restaurant Tracker',
    description: 'An application to track visits to Mexican restaurants, including price and ratings.',
    content: {
      creation: {
        entities: [
          {
            name: 'Restaurant',
            fields: [
              {
                reference: null,
                name: 'name',
                type: 'string'
              },
              {
                reference: null,
                name: 'location',
                type: 'string'
              },
              {
                reference: null,
                name: 'cuisineType',
                type: 'string'
              }
            ]
          },
          {
            name: 'Visit',
            fields: [
              {
                reference: null,
                name: 'date',
                type: 'date'
              },
              {
                reference: null,
                name: 'totalPrice',
                type: 'eur-amount'
              },
              {
                reference: null,
                name: 'rating',
                type: 'rating'
              },
              {
                reference: {
                  toType: 'Restaurant',
                  field: 'name',
                  referenceType: 'ManyToOne'
                },
                name: 'restaurant',
                type: 'Restaurant'
              },
              {
                reference: null,
                name: 'notes',
                type: 'string'
              }
            ]
          }
        ],
        name: 'MexicanFoodRestaurantTracker',
        type: 'application',
        sharing: {
          'with': 'Dont-code users'
        }
      }
    }
  }

  const PRJ_OLD_DEFINITION:OldDcApplicationModel={
    name: 'Recipe Collection Demo',
    description: 'Manage your recipes with this application',
    imgUrl: 'https://dont-code.net/assets/images/apps/desktop-background-cooking.jpg',
    content: {
      creation: {
        type: 'Application',
        name: 'Recipe Collection Demo',
        entities: {
          a: {
            name: 'Recipe',
            fields: {
              a: {
                name: 'Name',
                type: 'string'
              },
              b: {
                name: 'Picture',
                type: 'image'
              },
              c: {
                name: 'Website',
                type: 'link'
              },
              d: {
                name: 'From',
                type: 'country'
              }
            }
          }
        },
        sharing: {
          'with': 'Dont-code users'
        }
      }
    }
  }
