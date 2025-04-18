import { Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class MessageHandler {
  errorOccurred (error:any, errorMsg?:string) {
    console.error(errorMsg, error);
  }

  warningOccurred (warningMsg?:string) {
    console.warn(warningMsg);
  }

}
