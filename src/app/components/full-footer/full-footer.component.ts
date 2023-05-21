import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/auth/login.service';
import { CookieDeleteService } from 'src/app/services/cookie/cookie-delete.service';
import { CookieReadService } from 'src/app/services/cookie/cookie-read.service';

@Component({
  selector: 'app-full-footer',
  templateUrl: './full-footer.component.html',
  styleUrls: ['./full-footer.component.css']
})


export class FullFooterComponent {

  constructor(private cookieRead : CookieReadService, private cookieDelete : CookieDeleteService, private ls : LoginService, private router: Router) {}

  closed : boolean = true;

  isLoggedIn = this.ls.isLoggedIn.getValue();
  isLoggedInText = '';

  ngOnInit() {
    console.log(this.ls.isLoggedIn);
    this.isLoggedInText = this.ls.isLoggedIn? 'sign out' : 'sign in';
    this.ls.isLoggedIn.subscribe(isLogged => {
      this.isLoggedInText = isLogged? 'sign out' : 'sign in';
      this.isLoggedIn = isLogged;
    })
  }

  /**
   * Handles logging out of user
   */
  userLogClick() {
    if (this.ls.isLoggedIn.getValue()) {
      this.ls.logout();
    } else {
      this.router.navigate(['/auth/login'])
    }
  }

  /**
   * Expands site map div when clicked
   * @param event 
   */
  smClicked = (event: any) => {
    console.log("cookie: " + document.cookie)
    if (this.closed) {
      event.target.style.height = '74px';
      event.target.style.backgroundColor = 'var(--light_color)';
      this.closed = false;
    }
    else {
      event.target.style.height = '';
      event.target.style.backgroundColor = '';
      this.closed = true;
    }
  }

}
