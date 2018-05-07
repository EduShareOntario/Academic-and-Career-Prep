import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from "../../services/course.service";
import { Course } from "../../models/course";
import { Student } from "../../models/Student";
import { StudentService } from "../../services/student.service";
import { StaffService } from "../../services/staff.service";
declare var swal: any;
declare var moment;

@Component({
  selector: 'waitList',
  templateUrl: './app/components/wait-list/wait-list.component.html',
  styleUrls: ['./app/components/wait-list/wait-list.component.css']
})

export class WaitListComponent implements OnInit {
  data: any;
  students: Student[];
  courses: Course[];
  waitList: any[];
  timetables: any[];
  courseWaitList: any[];
  studentsWaiting:any = [];
  selectedCourse: Course[];

  constructor(private router: Router, private CourseService: CourseService, private StudentService: StudentService, private StaffService: StaffService) {

  }

  ngOnInit() {
    this.getStudents();
    //this.getTimetables();
  }

  getStudents() {
    this.StudentService
      .getStudents()
      .then(students => {
        if ((students as any).result === 'error') {
          this.students = null;
          this.displayErrorAlert(students);
        } else {
          this.students = students;
          for (let student of this.students) {
            student.fullName = student.firstName + " " + student.lastName;
          }
          this.getCourses();
        }
      })
      .catch(error => console.log("Error - Get students: " + error));
  }

  getCourses() {
    this.CourseService
      .getCourses()
      .then(result => {
        if ((result as any).result === 'error') {
          this.courses = null;
          this.displayErrorAlert(result);
        } else {
          //format datetime
          result.forEach((item) => {
            item.courseStart = moment(item.courseStart).format('YYYY-MM-DD');
            item.courseEnd = moment(item.courseEnd).format('YYYY-MM-DD');
            // item.classStartTime = moment(item.classStartTime).format('hh:mm A');
            // item.classEndTime = moment(item.classEndTime).format('hh:mm A');
          });
          this.courses = result;
          this.getWaitList();
        }
      })
      .catch(error => console.log("Error - Get courses: " + error));
  }

  getWaitList() {
    this.CourseService
      .getWaitList()
      .then(result => {
        if ((result as any).result === 'error') {
          this.waitList = null;
          this.displayErrorAlert(result);
        } else {
          this.waitList = result;
          console.log(this.waitList);
          for (let item of this.waitList) {
             var student = this.students.filter(x => x.userID === item.studentID);
             var course = this.courses.filter(x => x.courseID === item.courseID);
             student[0].fullName = student[0].firstName + " " + student[0].lastName;
             student[0].courseID = course[0].courseID;
             student[0].professorId = course[0].professorId;
             student[0].courseName = course[0].courseName;
             this.studentsWaiting.push(student[0]);
          }
          console.log(this.studentsWaiting);
        }
      })
      .catch(error => console.log("Error - Get wait list: " + error));
  }

  gotoStudentEnrollment(course, event: any) {
    this.router.navigate(['/student-enrollment', course.courseID, course.professorId, course.courseName]);
  }

  // getTimetables() {
  //   this.StudentService
  //     .getTimetables()
  //     .then(result => {
  //       if ((result as any).result === 'error') {
  //         this.timetables = null;
  //         this.displayErrorAlert(result);
  //       } else {
  //         this.timetables = result;
  //         console.log(this.timetables);
  //       }
  //     })
  //     .catch(error => console.log("Error - Get timetables: " + error));
  // }

  viewCourseWaitList(data) {
    this.selectedCourse = data;
    this.studentsWaiting = [];
    this.courseWaitList = this.waitList.filter(x => x.courseID === data.courseID);
    for (let item of this.courseWaitList) {
       var student = this.students.filter(x => x.userID === item.studentID);
       student[0].fullName = student[0].firstName + " " + student[0].lastName;
       this.studentsWaiting.push(student[0]);
    }
  }

  displayErrorAlert(error) {
    swal(
      error.title,
      error.msg,
      'error'
    );
  }

  goBack() {
    window.history.back();
  }
}
