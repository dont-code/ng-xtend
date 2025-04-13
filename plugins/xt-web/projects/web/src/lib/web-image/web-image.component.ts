import { ChangeDetectionStrategy, Component } from '@angular/core';
import { XtSimpleComponent } from 'xt-components';
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

  supportsImageUpload() {
    return true;
  }

  uploadImage($event: FileUploadHandlerEvent) {

  }
}
