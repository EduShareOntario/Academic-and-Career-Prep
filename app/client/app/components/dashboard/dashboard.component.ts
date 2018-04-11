import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { Client } from "../../models/client";
import { ClientService } from "../../services/client.service";

@Component({
    selector: 'dashboard',
    templateUrl: './app/components/dashboard/dashboard.component.html',
    styleUrls: ['./app/components/dashboard/dashboard.component.css']
})

export class DashboardComponent implements OnInit {
    client: Client[];

    consentForm: boolean;
    learningStyleForm: boolean;

    //variables used to toggle dahsboard items
    clientStatus = false;
    manageStudents = false;
    manageStaff = false;
    suitability = false;
    consent = false;
    manageCourses = false;
    caseNotes = false;
    learningStyle = false;
    maesdprf = false;
    timetable = false;
    attendanceList = false;
    attendanceReport = false;
    files = false;

    userType: any;

    constructor(private router: Router, private authService: AuthService, private clientService: ClientService) {

    }

    ngOnInit() {
        var currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser.active) {
          this.router.navigate(['/reset-password']);
        } else {
          var userType = currentUser.userType;
          var userID = currentUser.userID;
          this.checkAuth(userType, userID);
          this.consentForm = true;
          this.learningStyleForm = true;
        }
    }

    checkAuth(userType, userID) {
        this.userType = userType;
        if (userType.indexOf('Admin') >= 0) {
            this.clientStatus = true;
            this.manageStudents = true;
            this.manageStaff = true;
            this.suitability = true;
            this.caseNotes = true;
            this.manageCourses = true;
            this.attendanceReport = true;
            this.attendanceList = true;
            this.timetable = true;
            this.consent = true;
            this.learningStyle = true;
            this.files = true;
        }
        if (userType.indexOf('Staff') >= 0) {
            this.clientStatus = true;
            this.manageStudents = true;
            this.suitability = true;
            this.timetable = true;
            this.caseNotes = true;
            this.manageCourses = true;
            this.attendanceReport = true;
            this.files = true;
        }
        if (userType.indexOf('Instructor') >= 0) {
            this.attendanceList = true;
            this.attendanceReport = true;
            this.timetable = true;
            this.caseNotes = true;
        }
        if (userType === 'Student') {
            this.timetable = true;
        }
        if (userType === 'Client') {
            this.consent = true;
            this.learningStyle = true;
            //this.maesdprf = true;
            this.checkFormStatus(userID);
        }
    }

    checkFormStatus(userID) {
        this.clientService
            .getClient(userID)
            .then(object => {
                if (object.status === "403") {
                    this.client = null;
                    console.log("Error");
                } else {
                    this.client = object.client[0].firstName;
                    this.consentForm = object.client[0].consent;
                    this.learningStyleForm = object.client[0].learningStyle;
                }
            })
            .catch(error => console.log(error));
    }
}
