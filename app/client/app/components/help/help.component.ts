import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LearningStyleForm } from "../../models/learningStyleForm";
import { ClientService } from "../../services/client.service";
import { AuthService } from '../../services/authentication.service';
declare var swal: any;

@Component({
  selector: 'help',
  templateUrl: './app/components/help/help.component.html',
  styleUrls: ['./app/components/help/help.component.css']
})

export class HelpComponent {
  home: boolean = true;
  login: boolean = false;
  resetPass: boolean = false;
  newClient: boolean = false;
  manageClients: boolean = false;
  createStudent: boolean = false;
  manageStudents: boolean = false;
  manageCourses: boolean = false;
  assignStudentCourse: boolean = false;
  caseNotes: boolean = false;
  timetable: boolean = false;
  consent: boolean = false;
  learningStyle: boolean = false;
  attendanceReport: boolean = false;
  attendanceTaking: boolean = false;
  manageStaff: boolean = false;

  constructor(private clientService: ClientService, private router: Router, private authService: AuthService) {

  }

  open(page) {
    this.home = false;
    this.login = false;
    this.resetPass = false;
    this.newClient = false;
    this.manageClients = false;
    this.createStudent = false;
    this.manageStudents = false;
    this.manageCourses = false;
    this.manageStaff = false;
    this.assignStudentCourse = false;
    this.caseNotes = false;
    this.timetable = false;
    this.consent = false;
    this.learningStyle = false;
    this.attendanceReport = false;
    this.attendanceTaking = false;

    switch (page) {
      case 'home':
        return this.home = true;
      case 'login':
        return this.login = true;
      case 'resetPass':
        return this.resetPass = true;
      case 'newClient':
        return this.newClient = true;
      case 'manageClients':
        return this.manageClients = true;
      case 'createStudent':
        return this.createStudent = true;
      case 'manageStudents':
        return this.manageStudents = true;
      case 'manageStaff':
        return this.manageStaff = true;
      case 'manageCourses':
        return this.manageCourses = true;
      case 'assignStudentCourse':
        return this.assignStudentCourse = true;
      case 'timetable':
        return this.timetable = true;
      case 'consent':
        return this.consent = true;
      case 'learningStyle':
        return this.learningStyle = true;
      case 'attendanceReport':
        return this.attendanceReport = true;
      case 'attendanceTaking':
        return this.attendanceTaking = true;
      case 'caseNotes':
        return this.caseNotes = true;
      default:
        return this.home = true;
    }
  }

  goBack() {
    window.history.back();
  }
}
