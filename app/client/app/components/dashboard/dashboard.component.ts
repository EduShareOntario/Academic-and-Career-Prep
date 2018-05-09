import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { Client } from "../../models/client";
import { ClientService } from "../../services/client.service";
import { Student } from "../../models/student";
import { StudentService } from "../../services/student.service";
declare var swal: any;

@Component({
    selector: 'dashboard',
    templateUrl: './app/components/dashboard/dashboard.component.html',
    styleUrls: ['./app/components/dashboard/dashboard.component.css']
})

export class DashboardComponent implements OnInit {
    client: Client[];
    student: Student[];

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
    waitList = false;
    siteActivity = false;

    userType: any;

    constructor(private router: Router, private authService: AuthService, private clientService: ClientService,  private studentService: StudentService) {

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
            this.waitList = true;
            this.siteActivity = true;
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
            this.waitList = true;
            this.siteActivity = true;
        }
        if (userType.indexOf('Instructor') >= 0) {
            this.attendanceList = true;
            this.attendanceReport = true;
            this.timetable = true;
            this.caseNotes = true;
        }
        if (userType === 'Student') {
            this.timetable = true;
            this.consent = true;
            this.learningStyle = true;
            this.checkFormStatus(userType, userID);
        }
        if (userType === 'Client') {
            swal({
              title: 'Loading...'
            });
            swal.showLoading();
            this.consent = true;
            this.learningStyle = true;
            //this.maesdprf = true;
            this.checkFormStatus('client', userID);
        }
    }

    checkFormStatus(type, userID) {
      if (type === 'Client') {
        this.clientService
            .getClient(userID)
            .then(object => {
                if ((object as any).result === "error") {
                    this.client = null;
                    this.displayErrorAlert(object);
                } else {
                    this.client = object[0].firstName;
                    this.consentForm = object[0].consent;
                    this.learningStyleForm = object[0].learningStyle;
                    swal.close();
                }
            })
            .catch(error => console.log(error));
      } else if (type === 'Student') {
        this.studentService
            .getStudent(userID)
            .then(object => {
              console.log(object);
                if ((object as any).result === "error") {
                    this.student = null;
                    this.displayErrorAlert(object);
                } else {
                    this.student = object.firstName;
                    this.consentForm = object.consent;
                    this.learningStyleForm = object.learningStyle;
                    swal.close();
                }
            })
            .catch(error => console.log(error));
      }
    }

    displayErrorAlert(error) {
      swal(
        error.title,
        error.msg,
        'error'
      );
    }
}
