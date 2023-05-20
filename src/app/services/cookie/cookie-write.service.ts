import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieWriteService {

  constructor() { }

  /** Creates a cookie
   * 
   * @param cookie_name Name of cookie
   * @param cookie_data Data to be written with corresponding cookie_name
   * @param cookie_expiry Date of expiry
   */
  public write(cookie_name : string, cookie_data : string, cookie_expiry : string) {
    document.cookie = cookie_name + '=' + cookie_data + ';expires=' + cookie_expiry + ';path=/';
  }
}
