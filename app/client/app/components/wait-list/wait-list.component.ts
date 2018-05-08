import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from "../../services/course.service";
import { Course } from "../../models/course";
import { Student } from "../../models/student";
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
  viewingCourse: Course[];
  selectedCourse: Course[];
  selectedStudent: Student[];
  showForm: boolean = false;

  constructor(private router: Router, private CourseService: CourseService, private StudentService: StudentService, private StaffService: StaffService) {

  }

  ngOnInit() {
    swal({
      title: 'Loading...',
      allowOutsideClick: false
    });
    swal.showLoading();
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
    this.studentsWaiting = [];
    this.CourseService
      .getWaitList()
      .then(result => {
        if ((result as any).result === 'error') {
          this.waitList = null;
          this.displayErrorAlert(result);
        } else {
          this.waitList = result;
          for (let item of this.waitList) {
             var student = this.students.filter(x => x.userID === item.studentID);
             var course = this.courses.filter(x => x.courseID === item.courseID);
             //student[0].fullName = student[0].firstName + " " + student[0].lastName;
             // student[0].courseID = course[0].courseID;
             // student[0].professorId = course[0].professorId;
             student[0].courseName = course[0].courseName;
             var studentRecord = {
               fullName: student[0].fullName,
               courseName: student[0].courseName,
               date: item.date
             };
             this.studentsWaiting.push(studentRecord);
          }
          this.getTimetables();
        }
      })
      .catch(error => console.log("Error - Get wait list: " + error));
  }

  getTimetables() {
    this.StudentService
      .getTimetables()
      .then(result => {
        if ((result as any).result === 'error') {
          this.timetables = null;
          this.displayErrorAlert(result);
        } else {
          this.timetables = result;
          swal.close();
        }
      })
      .catch(error => console.log("Error - Get timetables: " + error));
  }

  showWaitListForm() {
    this.showForm = true;
  }

  addStudentToWaitList() {
    var CurrentDate = moment().format();
    var timetable = this.timetables.filter(x => x.courseID === this.selectedCourse && x.userID === this.selectedStudent);
    if (timetable[0] != null) {
        swal(
          'Whoops!',
          'That student is already enrolled in the selected course.',
          'warning'
        );
    } else if (this.selectedStudent == null || this.selectedCourse == null) {
      swal(
        'Invalid Input',
        'Please select both a student and a course.',
        'warning'
      );
    } else {
      swal({
        title: 'Saving...',
        allowOutsideClick: false
      });
      swal.showLoading();
      this.courseWaitList = null;
      this.showForm = false;
      this.CourseService
        .addToWaitList(this.selectedStudent, this.selectedCourse, CurrentDate)
        .then(result => {
          if ((result as any).result === 'error') {
            this.displayErrorAlert(result);
          } else if ((result as any).result === 'success')  {
            this.getWaitList();
            swal.close();
          } else {
            swal(
              'Error',
              'Something went wrong while adding student to wait list.',
              'error'
            );
          }
        })
        .catch(error => console.log("Error - Add student to wait list: " + error));
    }
  }

  closeMenu() {
    this.showForm = false;
  }

  gotoStudentEnrollment(course, data, event: any) {
    if (course == null) {
      course = this.courses.filter(x => x.courseName === data.courseName);
      course = course[0];
    }
    this.router.navigate(['/student-enrollment', course.courseID, course.professorId, course.courseName]);
  }

  viewCourseWaitList(data) {
    this.viewingCourse = data;
    this.studentsWaiting = [];
    this.courseWaitList = this.waitList.filter(x => x.courseID === data.courseID);
    for (let item of this.courseWaitList) {
       var student = this.students.filter(x => x.userID === item.studentID);
       student[0].fullName = student[0].firstName + " " + student[0].lastName;
       var studentRecord = {
         fullName: student[0].fullName,
         date: item.date
       };
       this.studentsWaiting.push(studentRecord);
    }
  }

  onPrint() {
    (window as any).print();
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
