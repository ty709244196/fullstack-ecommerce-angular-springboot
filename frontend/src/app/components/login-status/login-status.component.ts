import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  standalone: false,
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css'
})
export class LoginStatusComponent implements OnInit{

  isAuthenticated: boolean = false;
  userFullName: string = "";

  constructor(private oktaAuthService: OktaAuthStateService, @Inject(OKTA_AUTH) private oktaAuth: OktaAuth){

  }

  ngOnInit(): void {
      //subscribe to authetication state changes
      this.oktaAuthService.authState$.subscribe(
        (result) => {
          this.isAuthenticated = result.isAuthenticated!;
          this.getuserDetails();
        }
      );
  }
  getuserDetails() {
    if (this.isAuthenticated) {
      //fetch logged in user details
      //user full name is exposed as a property name
      this.oktaAuth.getUser().then(
        (res) => {
          this.userFullName = res.name as string;
        }
      );
    }
  }

  logout() {
    //terminates the seesion with Okta and remvoes current tokens
    this.oktaAuth.signOut();
    
  }

  

}
