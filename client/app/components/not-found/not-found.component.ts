import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authentication.service';

@Component({
    selector: 'notFound',
    templateUrl: './app/components/login/login.component.html',
    styleUrls: ['./app/components/login/login.component.css']
})

export class NotFoundComponent implements OnInit {
    error = '';

    constructor(private router: Router, private authenticationService: AuthService) { }

    ngOnInit() {

    }

}
