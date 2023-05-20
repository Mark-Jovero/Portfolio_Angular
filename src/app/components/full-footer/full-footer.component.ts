import { Component } from '@angular/core';
import { LoginService } from 'src/app/services/auth/login.service';
import { CookieDeleteService } from 'src/app/services/cookie/cookie-delete.service';
import { CookieReadService } from 'src/app/services/cookie/cookie-read.service';

@Component({
  selector: 'app-full-footer',
  templateUrl: './full-footer.component.html',
  styleUrls: ['./full-footer.component.css']
})


export class FullFooterComponent {

  constructor(private cookieRead : CookieReadService, private cookieDelete : CookieDeleteService, private ls : LoginService,) {}

  closed : boolean = true;
  
  isLoggedIn = this.cookieRead.read('session_cookie')===undefined? false : true;
  isLoggedInText = this.ls.isLoggedIn? 'sign out' : 'sign in';

  /**
   * Handles logging out of user
   */
  userLogClick() {
    if (this.ls.isLoggedIn) {
      this.ls.logout();
      this.isLoggedInText = 'sign in'
      //location.href = '/auth/login'
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
