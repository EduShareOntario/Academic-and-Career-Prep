import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/authentication.service';

@Injectable()
export class StudentGuard implements CanActivate {

    constructor(private router: Router, private authService: AuthService) { }

    canActivate() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        var userType = currentUser.userType;

        if (userType === "Student" || userType.indexOf('Admin') >= 0 || userType.indexOf('Instructor') >= 0 || userType.indexOf('Staff') >= 0) {
          return true;
        } else {
          // not logged in so redirect to login page
          this.router.navigate(['/dashboard']);
          return false;
        }
    }
}
