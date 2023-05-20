import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { response } from 'express';
import { lastValueFrom, map } from 'rxjs';
import { CookieReadService } from '../cookie/cookie-read.service';
import { CookieWriteService } from '../cookie/cookie-write.service';

@Injectable({
  providedIn: 'root'
})
export class VisitsService {

  constructor(private cookieRead: CookieReadService, private cookieWrite: CookieWriteService, private http: HttpClient) {}

  private queryCount() {
    let data = {
      user_id: this.cookieRead.read('user_id'),
      session_cookie: this.cookieRead.read('session_cookie'),
    }

    return this.http.post('http://localhost:3001/auth/stats/get/visit_count', data).pipe(
      map(response => response)
    )
  }

  async getCount() : Promise<number> {
    let proc = this.queryCount();
    let count = (await lastValueFrom(proc));
    let parsed = JSON.parse(JSON.stringify(count))
    console.log(parsed)
    return parseInt(parsed.stat_value1);
  }


}
