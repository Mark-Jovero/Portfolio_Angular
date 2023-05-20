import { HttpClient } from '@angular/common/http';
import { ReadVarExpr } from '@angular/compiler';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom, map } from 'rxjs';
import { CookieReadService } from '../cookie/cookie-read.service';
import { LoginService } from './login.service';
import { isDevMode } from '@angular/core';

export const AuthGuard = async () => {
  const ls = inject(LoginService);
  const router = inject(Router);
  const cookieRead = inject(CookieReadService);

  await ls.validateSession(cookieRead.read('user_id'), cookieRead.read('session_cookie'));

  if (ls.isLoggedIn) {
    if (isDevMode())
      console.log('AUTH GUARD SUCCESS : going to admin due to valid session')
    return true;
  }

  if (isDevMode())
    console.log('AUTH GUARD FAIL : going to login page due to invalid session')
  //return false;
  return router.parseUrl('auth/login');

}

