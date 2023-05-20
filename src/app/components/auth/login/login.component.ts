import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/auth/login.service';
import { CookieReadService } from 'src/app/services/cookie/cookie-read.service';
import { CookieWriteService } from 'src/app/services/cookie/cookie-write.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  emailInput = new FormControl('')
  passwordInput = new FormControl('')

  invalidCredentials = false;
  errorOccured = false;
  errorMessage = '';
  responseMessage = ''

  submittedEmailButUntouched = false;
  submittedPWButUntouched = false;

  accountCreationEnabled = false;

  isDataLoading = false;
  
  constructor(private ls : LoginService, private cread : CookieReadService, private cwrite : CookieWriteService, private router: Router) {
    
  }

  async getAccountCreationStatus(): Promise<string> {
    let response = (await this.ls.getAccountCreationStatus()).valueOf()
    let parsed = JSON.parse(JSON.stringify(response))
    return parsed.request_result.payload;
  }

  async ngOnInit() {
    let accCreationStatus = JSON.parse(JSON.stringify((await this.getAccountCreationStatus()).valueOf()))
    this.accountCreationEnabled = accCreationStatus[0].setting_value == '1'? true : false;
  }

  async submitLoginCredentials() {
    this.emailInput.markAsTouched;
    this.passwordInput.markAsTouched;
    this.isDataLoading = true;
    let loginPromise : Promise<string>;

    if (this.emailInput.valid && this.passwordInput.valid) {
      
      loginPromise = this.ls.login(this.emailInput.value, this.passwordInput.value)
      loginPromise.then(() => {
        this.isDataLoading = false;
      })
  
      let serverResponse = (await loginPromise).valueOf();
      let parsedServerResponse = JSON.parse(JSON.stringify(serverResponse));
      this.errorMessage = ''
      this.errorOccured = false;
      if (parsedServerResponse.__status == true) {
        this.invalidCredentials = false;
        this.ls.isLoggedIn = true;
        location.href = '/admin/dashboard'
      }
      else if (parsedServerResponse.__status == false) {
        if (parsedServerResponse.hasError) {
          this.errorOccured = true;
          this.errorMessage = parsedServerResponse.errorMessage;
        } else {
          this.invalidCredentials = true;
          this.responseMessage = parsedServerResponse.displayable_message
        }
      }
    }
    this.isDataLoading = false; 
  }
}
