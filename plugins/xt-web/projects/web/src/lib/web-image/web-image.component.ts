import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IStoreProvider, MessageHandler, StoreSupport, XtSimpleComponent } from 'xt-components';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { NgIf } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { Image } from 'primeng/image';

@Component({
  selector: 'xt-web-image',
  imports: [
    ReactiveFormsModule,
    FileUpload,
    NgIf,
    InputText,
    Image
  ],
  templateUrl: './web-image.component.html',
  styleUrl: './web-image.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebImageComponent extends XtSimpleComponent{

  msgHandler= inject(MessageHandler);

  store?:IStoreProvider<any>;

  displayIsInline = computed<boolean>( () => {
    const displayMode=this.context().displayMode;
    if ((displayMode == "INLINE_VIEW") || (displayMode == "LIST_VIEW")) {
      return true;
    } else {
      return false;
    }
  });

  constructor() {
    super();
    if (StoreSupport.isStoreManagerAvailable()) {
      this.store=StoreSupport.getStoreManager().getDefaultProvider();
    }
  }
  supportsImageUpload() {
    return this.store?.canStoreDocument();
  }

  async uploadImage($event: FileUploadHandlerEvent) {
    if (this.store!=null) {
      try {
        const docInfo = await this.store.storeDocument($event.files[0]);
        const done= this.context().setFormValue (docInfo.documentId, true);
        if (!done) throw new Error ("Cannot update form");
      } catch (err) {
        this.msgHandler.errorOccurred(err, "Error while uploading image");
      }

    }
  }
}
