import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom, map } from 'rxjs';
import { CookieReadService } from '../cookie/cookie-read.service';
import { LoginService } from './login.service';
import { isDevMode } from '@angular/core';

export const LoginGuard = async () => {
  const ls = inject(LoginService);
  const router = inject(Router);
  const cookieRead = inject(CookieReadService);

  if (!ls.isLoggedIn.getValue()) {
    if (isDevMode())
      console.log('LOGIN GUARD SUCCESS : going to login page due to invalid session.')
    return true;
  }

  if (isDevMode())
    console.log('LOGIN GUARD FAIL : going to admin dashboard due to already valid session.')
  //return false;
  return router.parseUrl('admin/dashboard')
}
