import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieDeleteService {

  constructor() { }

  /**Deletes a cookie
   * 
   * @param cookie_name Name of cookie to delete
   */
  public delete(cookie_name : string, ) {
    document.cookie = cookie_name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}
