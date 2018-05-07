import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions } from '@angular/http';
import { Course } from "../models/course";
import { AuthService } from './authentication.service';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CourseService {

  private courseUrl = 'api/course';  // URL to web app

  constructor(private http: Http,
    private authService: AuthService) { }

  getCourses(): Promise<Course[]> {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get(this.courseUrl, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get Courses"));
  }

  getInstructorCourses(id: string): Promise<Course[]> {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = "api/instructor-courses/" + id;

    return this.http.get(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get Intructors Courses"));
  }

  getCourse(id: string) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get(this.courseUrl + '/' + id, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get Course"));
  }

  getWaitList() {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get('api/wait-list', options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get waitlist"));
  }

  delete(course: Course) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    //headers.append('Content-Type', 'application/json');

    let url = `${this.courseUrl}/${course.courseID}`;

    return this.http
      .delete(url, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Delete Course"));
  }

  create(course: Course): Promise<Course> {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http
      .post(this.courseUrl, course, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Create New Course"));
  }

  update(course: Course) {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    let url = `${this.courseUrl}/${course.courseID}`;
    return this.http
      .put(url, course, options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Update Course"));
  }

  getCampuses() {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get('api/getCampuses', options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get Campuses"));
  }


  getInstructors() {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get('api/getInstructors', options)
      .toPromise()
      .then(response => response.json())
      .catch(err => this.handleError(err, "Get Instructors"));
  }

  private handleError(error: any, name: any) {
    console.log('An error occurred at ' + name, error);
  }

}
