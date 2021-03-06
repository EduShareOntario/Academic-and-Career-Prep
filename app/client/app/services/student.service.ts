import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { AuthService } from './authentication.service';
import { Student } from "../models/student";
import { Course } from "../models/course";
declare var moment: any;

@Injectable()
export class StudentService {

  private studentsUrl = 'api/students';  // URL to web api

  constructor(private http: Http, private authService: AuthService) { }

  getStudents(): Promise<Student[]> {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .get(this.studentsUrl, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get all students"));
  }

  getStudent(id: string) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .get(this.studentsUrl + '/' + id, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "get student by id"));
  }

  postNew(student: Student): Promise<Student> {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post(this.studentsUrl, student, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "postNew"));
  }

  archiveStudent(student: Student): Promise<Student> {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post('api/archive-student', student, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "archiveStudent"));
  }

  getStudentArchive() {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/get-student-archive`;

    return this.http.get(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get all student archive"));
  }

  updateGeneralInfo(student: Student): Promise<Student> {
      // add authorization header with jwt token
      let headers = new Headers({ authorization: this.authService.token });
      let options = new RequestOptions({ headers: headers });

      var url = 'api/students/general-info-update';

      return this.http
          .put(url, student, options)
          .toPromise()
          .then(response => response.json())
          .catch(err => this.handleError(err, "Update General Info"));
  }

  manualAttendanceCheck() {
      // add authorization header with jwt token
      let headers = new Headers({ authorization: this.authService.token });
      let options = new RequestOptions({ headers: headers });

      var url = 'api/students/attendance-check';

      return this.http
          .put(url, options)
          .toPromise()
          .then(response => response.json())
          .catch(err => this.handleError(err, "Run attendance check"));
  }

  requestEditConsent(): Promise<Student> {
    // get current user id from web token
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var currentUserID = currentUser.userID;
    let url = `api/students/${currentUserID}/requestEditConsent`;
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
        .put(url, options)
        .toPromise()
        .then(response => response.json())
        .catch(err => this.handleError(err, "Request to edit consent"));
  }

  grantConsentEditPermission(student, permission): Promise<Student> {
    // get current user id from web token
    let url = `api/students/grantConsentEditPermission`;
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });
    let objects = ({ student: student, permission:permission });
    return this.http
        .put(url, objects, options)
        .toPromise()
        .then(response => response.json())
        .catch(err => this.handleError(err, "Grant permission to edit consent"));
  }

  courseEnroll(userID, startDate, endDate, courseID, instructorID) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/enroll`;
    var info = [{
      userID: userID,
      courseID: courseID,
      instructorID: instructorID,
      startDate: startDate,
      endDate: endDate
    }];

    return this.http
      .post(url, info, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Course enroll"));
  }

  courseDrop(userID, courseID) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/drop/${userID}/${courseID}`;

    return this.http
      .delete(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Course drop"));
  }

  getTimetables() {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/timetables`;

    return this.http
      .get(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get timetables"));
  }

  getTimetablesByCourseId(courseID) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/timetables-course-id/${courseID}`;

    return this.http
      .get(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get timetables by course"));
  }

  getEventsById(userID) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/timetable/${userID}`;
    return this.http
      .get(url, options).toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get events by id"));
  }

  getStudentsById(timetables) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/get-students-id`;

    return this.http
      .post(url, timetables, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get students by id"));
  }

  saveNewNote(caseNote, studentID) {
    var caseNoteObject = { caseNote: caseNote, dateTime: moment().format('YYYY-MM-DD HH:mm:ss a') };

    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });
    let url = `api/caseNotes/${studentID}`;

    return this.http
      .post(url, caseNoteObject, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Save new note"));
  }

  getNotes(studentID) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/caseNotes/${studentID}`;

    return this.http
      .get(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get notes"));
  }

  deleteNote(noteID) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/caseNotes/${noteID}`;

    return this.http
      .delete(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Delete notes"));
  }

  insertAttendance(attendance) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/attendance`;

    return this.http
      .post(url, attendance, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Insert attendance"));
  }

  populatePRF(id: string) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });
    return this.http
      .get('api/prf/' + id, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Populate PRF"));
  }

  getAllAttendance() {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/attendance-report`;

    return this.http
      .get(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get all attendance"));
  }

  getAllFormsByID(student: Student) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `api/clientForms/${student.userID}`;

    return this.http
      .get(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get all student forms"));
  }

  private handleError(error: any, name: any) {
    console.log('An error occurred at ' + name, error);
  }

}
