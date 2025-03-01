import {TestBed} from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {XtApiStoreProvider} from "./xt-api-store-provider";
import { HttpClient, provideHttpClient } from '@angular/common/http';
import {toArray} from "rxjs/operators";
import { UploadedDocumentInfo } from '../xt-document';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';


describe('DontCode Api Store Manager', () => {

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let storeProvider: XtApiStoreProvider<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideExperimentalZonelessChangeDetection()]
    }).compileComponents();

    // Inject the http service and test controller for each test
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    storeProvider = TestBed.inject(XtApiStoreProvider);
    storeProvider.apiUrl = '/testData';
    storeProvider.docUrl = '/testDocs';
  });

  it('should list item', (done) => {
    expect(storeProvider).toBeDefined();
    //dtcde.getModelManager().resetContent(EXEMPLE_TEMPLATE);
    storeProvider.searchEntities("Entity1").subscribe({
      next: (value) => {
        expect(value).toBeTruthy();
        done();
      },
      error: (error) => {
        done(error);
    }});
    const call=httpTestingController.expectOne("/testData/Entity1");
    call.flush([{Field1:"Test"},{Field1:"Test2"}]);

    httpTestingController.verify();
  });

  it('should create, get, delete item', (done) => {
    expect(storeProvider).toBeDefined();
    //dtcde.getModelManager().resetContent(EXEMPLE_TEMPLATE);
      // Create the entity
    storeProvider.storeEntity("Entity1", {
      Field1:"Test12"
    }).then (value => {
      expect(value).toBeTruthy();
      expect(value._id).toBeTruthy();

      // Update the entity
      storeProvider.storeEntity("Entity1", {
        _id:"1343434",
        Field1:"Test23"
      }).then (value2 => {
        expect(value2._id).toEqual(value._id);
        // Delete the entity
        storeProvider.deleteEntity("Entity1", value2._id).then(value3 => {
          done();
        });
        call=httpTestingController.expectOne({method:'DELETE',url:"/testData/Entity1/1343434"});
        call.flush({_id:"1343434", Field1:"Test23"});
        httpTestingController.verify();
      });
      call=httpTestingController.expectOne({method:'PUT',url:"/testData/Entity1/1343434"});
      call.flush({_id:"1343434", Field1:"Test23"});

    }, error => {
      done(error);
    });
    let call=httpTestingController.expectOne({method:'POST',url: "/testData/Entity1"});
    call.flush({_id:"1343434", Field1:"Test12"});

  });

  it('should manage Items not found properly', async () => {
    expect(storeProvider).toBeDefined();
    //dtcde.getModelManager().resetContent(EXEMPLE_TEMPLATE);
    // Try to get an entity from a not existing model
/*    let call=httpTestingController.expectOne("/testData/UnknownEntity/First");
    call.flush(null, { status: 404, statusText: "Entity Type not found"});

    try {
      await storeProvider.loadEntity("UnknownEntity", "First");
      throw new Error ("No exception when getting an unknown entity");
    } catch (error) {
      httpTestingController.verify();
    }*/

    let callPromise: Promise<any>=Promise.resolve(undefined);
    let inError = false;

      // Try to load an  entity not found
    callPromise= storeProvider.loadEntity("Entity1", "Second");
    let call=httpTestingController.expectOne("/testData/Entity1/Second");
    call.flush(null, { status: 404, statusText: "Element not found"});
    try {
      await callPromise;
    } catch (error) {
      // Should throw an exception
      inError = true;
    }

    if (!inError) {
      throw new Error ("No exception thrown for an item not found.");
    }
    inError = false;
        // Try to load an  entity not found
    callPromise =storeProvider.deleteEntity("Entity1", "Third");
    call=httpTestingController.expectOne("/testData/Entity1/Third");
    call.flush(null, { status: 404, statusText: "Element not found"});
    try {
        await callPromise;
    } catch (error) {
      // Should throw an exception
      inError = true;
    }
    if (!inError) {
      throw new Error ("No error when trying to delete a non existing entity");
    }

  });

  it('can store documents', (done) => {
    expect(storeProvider).toBeDefined();

    const toUpload = [
      new File (['Test file'], 'testFile.txt'),
      new File (['Test File2'], 'testFile2.txt')
    ];

    // Try to get an entity from a not existing model
    storeProvider.storeDocuments(toUpload).pipe(toArray()).subscribe({
      next:(responses => {
        expect(responses).toHaveLength(2);
      }),
      complete: (() => {
        done();
      }),
      error: (err => {
        done("Error ", err);
      })
    });
    let call=httpTestingController.expectOne("/testDocs");
    call.flush([
      {documentName: 'testFile.txt', isUrl:true, documentId:'/testDocs/13434'} as UploadedDocumentInfo,
      {documentName: 'testFile2.txt', isUrl:true, documentId:'/testDoc/13445'} as UploadedDocumentInfo
    ]);

  });

});


const EXEMPLE_TEMPLATE= {
  creation: {
    name: "Test1",
      type: "application",
      entities: {
      "aaaa": {
        name: "Entity1",
          fields: {
          "aaab": {
            name: "Field1",
              type: "string"
          }
        }
      },
      "aaac": {
        name: 'Entity2',
          fields: {
          "aaad": {
            name: 'Name',
              type: 'boolean'
          }
        }
      }
    },
    screens: {
      "aaae": {
        name: "Screen1"
      },
      "aaaf": {
        name: "Screen2"
      }
    }
  }
}
