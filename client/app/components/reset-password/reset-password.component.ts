import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authentication.service';

@Component({
    selector: 'consentForm',
    templateUrl: './app/components/reset-password/reset-password.component.html',
    styleUrls: ['./app/components/reset-password/reset-password.component.css']
})


export class ResetPasswordComponent {
  error: any;
  private currentUser: any;
  private password1: string = "";
  private password2: string = "";
  private email: string;
  showSubmit: boolean = false;
  passLength: boolean = false;
  capital: boolean = false;
  weakPass: boolean = false;
  illegalCharacters: boolean = false;


  constructor( private router: Router, private authService: AuthService) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (this.currentUser) {

      } else {

      }
  }

  inputChange() {
    var capitalCount = 0;
    for (var i = 0; i < this.password1.length; i++) {
      if (/[A-Z]/.test(this.password1.charAt(i)))  {
        capitalCount++;
      }
    }

    if (/^[a-zA-Z0-9- ]*$/.test(this.password1) === false) {
      this.illegalCharacters = true;
    } else {
      this.illegalCharacters = false;
    }

    if (this.password1.length >= 8 && this.password1.length <= 25) {
      this.passLength = true;
    } else if (this.password1.length > 25) {
      this.passLength = false;
    } else {
      this.passLength = false;
    }

    if (this.password1.length < 10 && this.password1.length >= 8 && capitalCount < 2 && capitalCount !== 0) {
      this.weakPass = true;
    } else {
      this.weakPass = false;
    }

    if (capitalCount >= 1) {
      this.capital = true;
    } else {
      this.capital = false;
    }

    if (this.password1 === this.password2 && this.passLength && this.capital) {
      this.showSubmit = true;
    } else {
      this.showSubmit = false;
    }
  }

  resetPassword() {
    this.authService.resetPassword(this.currentUser.userID, this.password1)
    .then(result => {
      if (result) {
        this.router.navigate(['/login']);
      } else {
        console.log("There was an error with your request...");
      }
    }).catch(error => {
      console.log(error);
    });
  }

  requestReset() {
    this.authService.requestReset(this.email)
    .then(result => {
      if (result) {
        this.router.navigate(['/login']);
      } else {
        console.log("There was an error with your request...");
      }
    }).catch(error => {
      console.log(error);
    });
  }

  goBack() {
      this.router.navigate(['/login']);
  }
}
