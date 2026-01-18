import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AutoComplete } from 'primeng/autocomplete';

import { ManyToOneRefComponent } from './many-to-one-ref.component';
import { beforeEach, describe, expect, it } from 'vitest';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { registerDefaultPlugin } from '../register';
import {
  HostTestTypedFormComponent,
  StoreSupport,
  StoreTestHelper,
  XtResolverService,
  XtSimpleComponent
} from 'xt-components';
import { CommonModule } from '@angular/common';
import { XtTypeInfo } from 'xt-type';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('ManyToOneRefComponent', () => {
  let component: ManyToOneRefComponent;
  let fixture: ComponentFixture<ManyToOneRefComponent>;
  let resolverService: XtResolverService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManyToOneRefComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()]
    })
    .compileComponents();

    resolverService=TestBed.inject(XtResolverService);
    registerDefaultPlugin(resolverService);
    StoreTestHelper.ensureTestProviderOnly();

  });

  it('should list & select referenced entity',async () => {

    // Register types with references
    resolverService.registerPlugin({
      name:'TestRefPlugin',
      types: BOOK_AUTHOR_TYPES,
      components: [
        {
          componentName:'testAuthorComponent',
          componentClass:TestAuthorComponent,
          typesHandled: ['authorType']
        }
      ]
    });

    resolverService.resolvePendingReferences();

    const storeMgr = StoreSupport.getStoreManager();
    const authorStore = storeMgr.getProviderSafe<AuthorTestType>('authorType');
    const bookStore = storeMgr.getProviderSafe<BookTestType>('bookType');

    const philipKDick=await authorStore.storeEntity('authorType', {
      fullName:'Philip K. Dick',
      city:'Chicago',
      born:new Date (1928, 12, 16)
    });

    const annLeckie = await authorStore.storeEntity('authorType', {
      fullName:'Ann Leckie',
      city:'Toledo',
      born:new Date (1966, 3, 2)
    });

    const hostFixture = TestBed.createComponent(HostTestTypedFormComponent);
    hostFixture.componentRef.setInput('formDescription', {
      value: {
        name:'old book',
        authorRef: null,
        genreRef: null
      }
    });
    hostFixture.componentRef.setInput('controlName', 'value');
    hostFixture.componentRef.setInput('valueType', 'bookType');

    const host = hostFixture.componentInstance;
    expect(host).toBeTruthy();
    hostFixture.detectChanges();

    component = hostFixture.debugElement.query(By.directive(ManyToOneRefComponent)).componentInstance as ManyToOneRefComponent;
    expect(component).toBeTruthy();

    const autocomplete = hostFixture.debugElement.query(By.directive(AutoComplete));
    expect(autocomplete).toBeTruthy();

    await hostFixture.whenStable(); // Ensure the list of option is loaded

    // Simulate click on dropdown button to load all suggestions
    autocomplete.query(By.css('.p-autocomplete-dropdown')).nativeElement.click();
    hostFixture.detectChanges();

    // Check the number of suggestion items
    let suggestionItems = autocomplete.queryAll(By.directive(TestAuthorComponent));
    expect(suggestionItems.length).toBe(2);

    // Select the first author
    expect(suggestionItems[0].nativeElement.textContent).toEqual('Philip K. Dick(Chicago)');
    suggestionItems[0].nativeElement.click();
    hostFixture.detectChanges();

    // Check the value is correct
    expect(host.createdFormGroup()?.value.value['authorRef']).toEqual(philipKDick);
    expect(autocomplete.query(By.css('input')).nativeElement.value).toEqual('Philip K. Dick(Chicago)');

      // Now select another reference
    autocomplete.query(By.css('.p-autocomplete-dropdown')).nativeElement.click();
    hostFixture.detectChanges();

    await hostFixture.whenStable();
    await hostFixture.whenStable();
    await hostFixture.whenStable();
    // Check the number of suggestion items
    suggestionItems = autocomplete.queryAll(By.directive(TestAuthorComponent));
    expect(suggestionItems.length).toBe(2);

    // Select the first author
    suggestionItems[1].nativeElement.click();
    hostFixture.detectChanges();
    await hostFixture.whenStable();
    await hostFixture.whenStable();
    await hostFixture.whenStable();

    // Check the value is correct
    expect(host.createdFormGroup()!.value.value['authorRef']).toEqual(annLeckie);

    // Check that changing the value in the form changes as well the display
    host.createdFormGroup()!.get('value.authorRef')!.setValue(philipKDick);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    expect(autocomplete.query(By.css('input')).nativeElement.value).toEqual('Philip K. Dick(Chicago)');

    // Check that changing the form itself changes the display
    hostFixture.componentRef.setInput('formDescription',  {
      value: {
        name:'New Book',
        authorRef:annLeckie,
        genreRef:'Fiction'
      }
    });
    hostFixture.detectChanges();
    await hostFixture.whenStable();
    await hostFixture.whenStable();

    expect(hostFixture.debugElement.query(By.css('input[name="name"]')).nativeElement.value).toEqual('New Book');
    expect(autocomplete.query(By.css('input')).nativeElement.value).toEqual('Ann Leckie(Toledo)');

  });
});

type BookTestType = {
  name:string,
  authorRef: AuthorTestType,
  genreRef: string
}

type AuthorTestType = {
  fullName:string,
  born:Date,
  city:string
}

const BOOK_AUTHOR_TYPES:XtTypeInfo = {
  authorType: {
    displayTemplate:'<%=it.fullName%>(<%=it.city%>)',
    children:{
      fullName:'string',
      city:'string',
      born:'date'
    }
  },
  bookGenreType: {
    name:'string'
  },
  bookType: {
    children:{
      name:'string',
      authorRef:{
        toType:'authorType',
        referenceType:'MANY-TO-ONE',
        field:'fullName'
      },
      genreRef: {
        toType:'bookGenreType',
        referenceType:'MANY-TO-ONE',
        field:'name'
      }
    }
  }
}

/**
 * A custom component is defined to display authors. It must be used by the set
 */
@Component({
  selector: 'test-author',
  standalone: true,
  imports: [CommonModule],
  template: '@if (isInForm()) {\
    \
    \
  } @else {\
  @let value=displayValue();\
  @if (value!=null) {\
    @if (context().displayMode=="INLINE_VIEW") {{{value.fullName}}({{value.city}})}\
  }\
  \
  }',
})

export class TestAuthorComponent extends XtSimpleComponent<AuthorTestType> {
}
