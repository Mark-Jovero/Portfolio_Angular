import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieReadService {

  constructor() { }

  /** Finds and returns cookie data given cookie name
   * 
   * @param cookie_name Name of cookie to search for
   * @returns corresponding cookie date associated with cookie_name OR undefined
   */
  public read(cookie_name : string, ) {
    let cookies_array = document.cookie.split(';'); // split cookie string with ';' delimiter. ['cookie1name=cookie1data', 'expires=cookie1expiry', path='/', ...cookie2]
    
    var i, cookie_slice;
    for (i = 0; i < cookies_array.length; i++) {
      cookie_slice = cookies_array[i].split('=');

      if (cookie_slice[0].trim() == cookie_name) { // cookie is found
        return cookie_slice[1];
      } else {
        
        // cookie not found, skip to next set
        continue;       
      }
    }

    return undefined;
  }
}
