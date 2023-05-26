import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, EMPTY, map, Observable, throwError } from 'rxjs';
import { CookieDeleteService } from '../cookie/cookie-delete.service';
import { CookieReadService } from '../cookie/cookie-read.service';
import { lastValueFrom } from 'rxjs';
import { BACKEND_HOST } from '../../../globals'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  isLoggedIn =  new BehaviorSubject<boolean>(false);
  payload = ''

  constructor(private http : HttpClient, private coockieDelete : CookieDeleteService, private cookieRead : CookieReadService, private router: Router) {
    if (cookieRead.read('session_cookie')) {
      this.isLoggedIn.next(true)
      console.log(this.isLoggedIn)
    }
  }

  setLoginStatus(status: boolean) {
    this.isLoggedIn.next(status);
  }

  getUserId() {
    return this.cookieRead.read('user_id');
  }

  submitLoginCredentials(email : string | null, password : string | null) : Observable<string>{
    let body = {
       'email' : email,
       'password' : password,
       'device_information' : navigator.userAgent,

    }
   
    return this.http.post(BACKEND_HOST + 'user/login', body, {responseType: 'text', withCredentials: true,}).pipe(
      map(response => response),
    );
  }

  async login(email : string | null, password : string | null) : Promise<string> {

    let res = this.submitLoginCredentials(email, password);

    try {
    this.payload = await lastValueFrom(res);
    }
    catch (err) {
      let errorParsed = JSON.parse(JSON.stringify(err));

      console.log(errorParsed)

      if (errorParsed.name == 'HttpErrorResponse') {
        return -1+'';
      }
    }
    console.log(this.payload , '!!!')
    let parsedPayload = JSON.parse(this.payload);
    console.log(parsedPayload)
    let status = parsedPayload.__status;
    
    if (status == true) {
      console.log(this.isLoggedIn)
      //this.isLoggedIn.next(true);
    } else {
      //console.log(this.isLoggedIn.getValue())
      this.isLoggedIn.next(false);
    }

    return parsedPayload;
  }

  public logout() {
    console.log("logout called")
    let data = {
      user_id: this.cookieRead.read('user_id'),
      session_cookie: this.cookieRead.read('session_cookie'),
    }

    this.http.post(BACKEND_HOST + 'auth/logout', data).subscribe();

    this.isLoggedIn.next(false);
    this.coockieDelete.delete('session_cookie');
    this.coockieDelete.delete('user_id');

    this.router.navigate(['/auth/login']);
  }

  private requestSessions(user_id : string | undefined, session_cookie : string | undefined) : Observable<string> {
    let body = {
      session_cookie: session_cookie,
      user_id: user_id,
    }

    console.log(body)
  
   return this.http.post(BACKEND_HOST + 'auth/get/sessions', body, {responseType: 'text', withCredentials: true,}).pipe(
     map(response => response)
   );
  }

  public async getSessions(user_id : string | undefined, session_cookie : string | undefined) : Promise<string> {
    const res = this.requestSessions(user_id, session_cookie);
    let ares = await lastValueFrom(res);

    let parsed = JSON.parse(ares);

    return parsed;
  }

  private requestValidateSession(user_id : string | undefined, session_cookie : string | undefined) : Observable<string> {
    let body = {
      session_cookie: session_cookie,
      user_id: user_id,
    }

    console.log("req val ses")
  
   return this.http.post(BACKEND_HOST + 'auth/', body, {responseType: 'text', withCredentials: true,}).pipe(
     map(response => response)
   );
  }

  async validateSession(user_id : string | undefined, session_cookie : string | undefined) : Promise<boolean> {
    let req = this.requestValidateSession(user_id, session_cookie);
    let res = await lastValueFrom(req);
    let parsedRes = JSON.parse(res);

    console.log(parsedRes)

    if (parsedRes) {
      this.isLoggedIn.next( parsedRes.__status);
    }

    return this.isLoggedIn.value;
  }

  request_session_remove(session_id_key : string, session_id : string) : {} {
    let u_confirm_input = confirm('Are you sure you want to remove the following session? \nSESSION ID: ' + session_id)

    if (u_confirm_input) {
      let body = {
        user_id: this.cookieRead.read('user_id'),
        session_cookie: this.cookieRead.read('session_cookie'),
        session_id: session_id_key,
      }

      this.http.post(BACKEND_HOST + 'auth/del/session', body).subscribe(
        response => {
          return this.loadSessionData();
        }
      );

    } 
    return {};
  }

  /**
  * Retrieve session data for user
  */
  async loadSessionData(): Promise<{}> {
    let response = await this.getSessions(this.cookieRead.read('user_id'), this.cookieRead.read('session_cookie'));
    let parsedResponse = JSON.parse(JSON.stringify(response))
    return parsedResponse.request_result.payload
  }

/**
 * Retrieve Account creation status
 */
private request_acc_creation_status(): Observable<string> {
  return this.http.get(BACKEND_HOST + 'settings/get/account_creation_enabled',  {responseType: 'text', withCredentials: true,}).pipe(
        map(response => response)
      );
}

private create_account(email: string, password: string, key: string): Observable<string> {
  let body = {
    email: email,
    password: password,
    key: key,

  }

  console.log(body)
  return this.http.post(BACKEND_HOST + 'create_account', body,  {responseType: 'text', withCredentials: true,}).pipe(
        map(response => response)
      );
}

async getAccountCreationStatus(): Promise<string> {
  let req = this.request_acc_creation_status();
  let res = lastValueFrom(req);
  let parsedResponse = JSON.parse(await res)
  return parsedResponse
}

async createAccount(email: string, password: string, key: string): Promise<string> {
  let req = this.create_account(email, password, key);
  let res = lastValueFrom(req);
  return await res
}


}
