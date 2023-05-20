import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { delay } from 'rxjs';
import { LoginService } from 'src/app/services/auth/login.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent {

constructor(private ls: LoginService, private router: Router) {}

successfulAccountCreation = false;
delayTime = 3000 //ms
isDataLoading = false;
isAccountCreationOneTimeEnabled = false;
hasError = false;
errorMessage = '';

credentialsForm = new FormGroup({
  email: new FormControl(),
  confirmEmail: new FormControl(),
  password: new FormControl(),
  confirmPassword: new FormControl(),
  key: new FormControl(),

})

async ngOnInit() {
  
  let accCreationReq = await this.ls.getAccountCreationStatus()
  let parsedResponse = JSON.parse(JSON.stringify(accCreationReq))
  this.isAccountCreationOneTimeEnabled = parsedResponse.request_result.payload[1].setting_value == '1' ? true : false;
  
}


async submitCreateCredentials() {
  let email = this.credentialsForm.get('email')?.value;
  let password = this.credentialsForm.get('password')?.value;
  let key = this.credentialsForm.get('key')?.value

  if (this.credentialsForm.get('email')?.value != this.credentialsForm.get('confirmEmail')?.value)
    this.credentialsForm.get('email')?.setErrors({'incorrect': true});
  else {
    this.credentialsForm.get('email')?.setErrors(null);
  }

  if (this.credentialsForm.get('password')?.value != this.credentialsForm.get('confirmPassword')?.value)
    this.credentialsForm.get('password')?.setErrors({'incorrect': true});
  else {
    this.credentialsForm.get('password')?.setErrors(null);
  }

  this.credentialsForm.markAllAsTouched();

  if (this.credentialsForm.valid) {
    let createReq = await this.ls.createAccount(email, password, key);
    let parsed = JSON.parse(createReq)
    console.log(parsed)
    if (parsed.hasError) {
      this.hasError = true;

      if (parsed.request_result.payload != null) {
        this.errorMessage = parsed.request_result.payload.code == 'ER_DUP_ENTRY' ? 'This email is already taken.' : 'Unknown error has occured.';
      }
      else if (parsed.errorMessage == 'UNKNOWN KEY') {
        this.errorMessage = 'This key is unknown.';
      } else {
        this.errorMessage = parsed.errorMessage;
      }
    } else {
      console.log("SUCCESS")
      this.successfulAccountCreation = true;
      setTimeout(()=>{
        location.href = '/auth/login'
      }, 3000)

    }
  }
}

}
