import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom, Observable } from 'rxjs';
import { LoginService } from 'src/app/services/auth/login.service';
import { CookieReadService } from 'src/app/services/cookie/cookie-read.service';
import { VisitsService } from 'src/app/services/stats/visits.service';
import { BACKEND_HOST } from '../../../globals'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  http = inject(HttpClient);
  cookieRead = inject(CookieReadService);
  ls = inject(LoginService)
  vs = inject(VisitsService)

  formatDate(dateString : string): string {
    let date = new Date(dateString)
    return date.toLocaleString();
  }

  siteSettingsFormGroup = new FormGroup({
    passwordInput : new FormControl(''),
    accountCreationCB : new FormControl(),
    accountCreationOneTimeCB : new FormControl(true)
  });

  uniq_count = -1;

  raw_session_data = {}
  session_data = {}

  setting_change_response = {}
  settings = [{}]

  key_loading = false;
  creation_key = undefined;
  recieved_server_response_settingSet = false;
  display_message_settingSet_status = document.createElement('div')

  async ngOnInit() {
    let response = await this.ls.loadSessionData();
    this.session_data = response;

    let body = {
      user_id: this.cookieRead.read('user_id'),
      session_cookie: this.cookieRead.read('session_cookie'),
      
    }
    let req = this.http.post(BACKEND_HOST + 'auth/settings/get', body).pipe(
      response => response
    );

    let response_get_settings = await lastValueFrom(req);
    this.settings = JSON.parse(JSON.stringify(response_get_settings)).request_result.payload
    
    this.loadSettings();
  }

  loadSettings() {
    this.creation_key = undefined

    let parsed__1 = JSON.parse(JSON.stringify(this.settings[0]))
    let parsed__2 = JSON.parse(JSON.stringify(this.settings[1]))
    this.siteSettingsFormGroup.get('accountCreationCB')?.setValue(parsed__1.setting_value == '1' ? true : false)
    this.siteSettingsFormGroup.get('accountCreationOneTimeCB')?.setValue(parsed__2.setting_value == '1' ? true : false)
    this.creation_key = parsed__2.setting_value2
    //this.siteSettingsFormGroup.get('accountCreationOneTimeCB')?.setValue(this.settings.enableTemporaryAccountCreation == '1' ? true : false)
  }

  async siteSettingsOnSubmit(event: any, formGroup: FormGroup) {
    this.key_loading = true;
    this.recieved_server_response_settingSet = false;

    let pwInput = this.siteSettingsFormGroup.get('passwordInput')?.value;
    let accCreationBool = this.siteSettingsFormGroup.get('accountCreationCB')?.value;
    let accCreationOneTimeBool = this.siteSettingsFormGroup.get('accountCreationOneTimeCB')?.value;

    let body = {
      user_id: this.cookieRead.read('user_id'),
      session_cookie: this.cookieRead.read('session_cookie'),
      enableAccountCreation: accCreationBool,
      enableTemporaryAccountCreation: accCreationBool == false ? false : accCreationOneTimeBool,
      
    }

    let req = this.http.post(BACKEND_HOST + 'auth/settings/set/account_creation', body).pipe(
      response => response
    );

    let response = await lastValueFrom(req);
    let parsedResponse = JSON.parse(JSON.stringify(response));
    this.key_loading = false;

    this.recieved_server_response_settingSet = true;
    this.creation_key = parsedResponse.request_result.payload.key

    if (parsedResponse.__status) {
      this.display_message_settingSet_status.innerHTML = 'Settings applied.'
    } else {
      this.display_message_settingSet_status.innerHTML = 'Could not apply settings. Check error logs.'
    }

    event.preventDefault();
  }

  async removeSession(session_id: string, session_cookie: string) {
    this.ls.request_session_remove(session_id, session_cookie);

    let response = await this.ls.loadSessionData();
    this.session_data = response;
  }


}
