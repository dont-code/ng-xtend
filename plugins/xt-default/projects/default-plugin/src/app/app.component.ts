import { Component, inject, OnDestroy, signal } from '@angular/core';
import { EventType, Router, RouterOutlet } from '@angular/router';
import { StoreSupport, StoreTestHelper, XtResolverService } from 'xt-components';
import { registerDefaultPlugin } from '../../../default/src/lib/register';
import { XtTypeInfo } from 'xt-type';
import { AuthorTestType } from './test-types/ref-test-types';
import { TestAuthorComponent } from './test-types/test-author.component';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toolbar, Button, Tooltip],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  title = 'DefaultTester';

  protected resolverService = inject (XtResolverService);
  protected router = inject (Router);
  protected subscriptions = new Subscription();

  currentPage = signal<string>('/');

  static authorPkDick: AuthorTestType|null=null;
  static authorAnnLeckie: AuthorTestType|null=null;

  constructor () {
    registerDefaultPlugin(this.resolverService);

    // Register types for testing references
    this.resolverService.pluginRegistry.registerComponent ({
      componentName:'testAuthorComponent',
      componentClass:TestAuthorComponent,
      typesHandled: ['authorType']
    });
    this.resolverService.registerTypes (BOOK_AUTHOR_TYPES);
    this.resolverService.resolvePendingReferences();
    StoreTestHelper.ensureTestProviderOnly();
    this.initReferenceData ().then (() => {});
    this.subscriptions.add(this.router.events.subscribe((evt) => {
      if (evt.type==EventType.ActivationEnd) {
        if (evt.snapshot.url[0]?.path!=null)
          this.currentPage.set('/'+evt.snapshot.url[0].path);
        else
          this.currentPage.set('/');
      }
    }));
  }

  ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

  async initReferenceData() {
    const storeMgr = StoreSupport.getStoreManager();
    const authorStore = storeMgr.getProviderSafe<AuthorTestType>('authorType');
    //const bookStore = storeMgr.getProviderSafe<BookTestType>('bookType');

    AppComponent.authorPkDick=await authorStore.storeEntity('authorType', {
      fullName:'Philip K. Dick',
      city:'Chicago',
      born:new Date (1928, 12, 16)
    });

    AppComponent.authorAnnLeckie = await authorStore.storeEntity('authorType', {
      fullName:'Ann Leckie',
      city:'Toledo',
      born:new Date (1966, 3, 2)
    });

    // We simulate a reference by injecting the entity directly
/*    await bookStore.storeEntity('bookType', {
      name:'Ubik',
      authorRef:philipKDick,
      genreRef:'SF'
    });

    await bookStore.storeEntity('bookType', {
      name:'Ancillaire',
      authorRef:AnnLeckie,
      genreRef:'Space Opera'
    });
*/
  }

}

const BOOK_AUTHOR_TYPES:XtTypeInfo = {
  authorType: {
    fullName:'string',
    city:'string',
    born:'date',
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
