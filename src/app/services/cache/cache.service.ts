import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  write(key: string, value: string, isComplex: boolean) {
    if(isComplex)
      window.localStorage.setItem(key, JSON.stringify(value));
    else
      window.localStorage.setItem(key, value);
  }

  read(key: string) : string | null {
    return window.localStorage.getItem(key);
  }

  delete(key: string) {
    window.localStorage.removeItem(key);
  }
}
