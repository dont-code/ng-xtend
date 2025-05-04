import {TestBed} from '@angular/core/testing';
import {IndexedDbStorageService} from "./indexed-db-storage.service";
import {map} from "rxjs/operators";
import {lastValueFrom} from "rxjs";
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('DevTemplateManagerService', () => {
  let service: IndexedDbStorageService<{_id:string,code:string}>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()]
    });
    service = TestBed.inject<IndexedDbStorageService<{_id:string,code:string}>>(IndexedDbStorageService<{_id:string,code:string}>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and load entity', done => {
      service.storeEntity('entityA', {
        dueDate:'2020-08-01',
        code:'testA',
        count:10,
        valid:true
      }).then (value => {
        return service.loadEntity('entityA', value._id);
      }).then(value => {
        expect (value?.code).toEqual('testA');
        done();
      }).catch((reason:Error) => {
        done(reason.name+':'+reason.message);
      });

  });

  it('should store and delete entity', done => {
    service.storeEntity('entityB', {
      dueDate:'2020-08-01',
      code:'testB',
      count:10,
      valid:true
    }).then (entity => {
      return service.deleteEntity('entityB', entity._id).then(deleted => {
        return {key: entity._id, deleted};
      });
    }).then(value => {
      expect (value.deleted).toEqual(true);
      return service.loadEntity('entityB', value.key)
    }).then (entity => {
      expect(entity).toBeFalsy(); // loadEntity returns undefined for a non-existant key;
      done();
    }).catch ((reason:Error) => {
      done(reason.name+':'+reason.message);
    })
  });

  it('should list entities',  async () => {
      // Store 10 elements in the database
    for (let i=0;i<10;i++) {
      await service.storeEntity('entityC', {
        dueDate: '2020-08-01',
        code: 'testC'+i,
        count: i,
        valid: true
      });
    }

    const cumul = new Array<any>();
    await lastValueFrom(
         service.searchEntities('entityC').pipe (
         map (values => {
           cumul.push(...values);
           return cumul;
          })
       )).then (values => {
      expect (values.length).toEqual(10);
    });
  });
});

