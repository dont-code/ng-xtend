import { Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root'
})
/** Service for handling error and warning messages throughout the application */
export class XtMessageHandler {
  /**
   * Handles an error occurrence by logging it to the console
   * @param error - The error object
   * @param errorMsg - Optional custom error message
   */
  errorOccurred (error:any, errorMsg?:string) {
    console.error(errorMsg, error);
  }

  /**
   * Handles a warning occurrence by logging it to the console
   * @param warningMsg - Optional warning message
   */
  warningOccurred (warningMsg?:string) {
    console.warn(warningMsg);
  }

}
