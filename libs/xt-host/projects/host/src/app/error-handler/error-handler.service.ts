import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  errorOccured (error:any, errorMsg?:string) {
    console.error(errorMsg, error);
  }

  warningOccured (warningMsg?:string) {
    console.warn(warningMsg);
  }
}
