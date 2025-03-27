import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  messageService = inject(MessageService);

  constructor() { }

  errorOccurred (error:any, errorMsg?:string) {
    console.error(errorMsg, error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error occured',
      detail: errorMsg,
      data: error
    });
  }

  warningOccurred (warningMsg?:string) {
    console.warn(warningMsg);
    this.messageService.add({
      severity: 'warning',
      summary: 'Warning',
      detail: warningMsg
    });
  }
}
