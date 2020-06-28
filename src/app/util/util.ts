import { Component, OnInit } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { Logger, CryptoUtils } from 'msal';
import { HttpClient } from '@angular/common/http';
import { logging } from 'protractor';
const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';
const accessTokenRequest = {
  scopes: ["user.read"]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'MSAL - Angular 9 Sample App';
  isIframe = false;
  loggedIn = false;
  profile: any;
  msalToken;

  constructor(private broadcastService: BroadcastService,
    private authService: MsalService,
    private http: HttpClient) { }

  ngOnInit() {
    this.isIframe = window !== window.parent && !window.opener;
    this.login();
  }

  checkoutAccount() {
    this.loggedIn = !!this.authService.getAccount();
  }

  login() {
    const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;
    if (isIE) {
      this.authService.loginRedirect();
    } else {
      this.authService.loginPopup();
    }
  }

  logout() {
    this.authService.logout();
  }

  loginPromise = this.broadcastService.subscribe('msal:loginSuccess', response => {
    console.log('Login Success');
    this.authService.acquireTokenSilent(accessTokenRequest);
  });

  getTokenPromiseSuccess = this.broadcastService.subscribe("msal:acquireTokenSuccess", (payload) => {
     console.log('Access Token Success');
     this.msalToken = payload.accessToken;
  });
  getTokenPromiseFailure = this.broadcastService.subscribe("msal:acquireTokenFailure", (err) => {
    console.log('Access Token Failure', err);
  });
  getToken() {
    if(this.getTokenPromiseSuccess){
      console.log('API to getToken');
      return console.log(this.msalToken);
    }
    else{
      console.log('Calling getToken recursively');
      this.getToken();
    }

  }
  getProfile() {
    this.http.get(GRAPH_ENDPOINT)
      .toPromise().then(profile => {

        this.profile = profile;
      });
  }

}
