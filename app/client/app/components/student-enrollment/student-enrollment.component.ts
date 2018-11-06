import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Course } from "../../models/course";
import { Student } from "../../models/Student";
import { CourseService } from "../../services/course.service";
import { StudentService } from "../../services/student.service";
declare var swal: any;
declare var moment: any;

@Component({
  selector: 'course-selection',
  templateUrl: './app/components/student-enrollment/student-enrollment.component.html',
  styleUrls: ['./app/components/student-enrollment/student-enrollment.component.css']
})

export class StudentEnrollmentComponent implements OnInit {
  studentTimetables: any[];
  loading: boolean = true;
  tempTimetableArry: any[] = [];
  enrollMultiple: boolean;
  // if enrolling multiple students
  students: Student[];
  courseID: any;
  instructorID: any;
  courseName: any;
  // if enrolling specific student
  student: Student[];
  courseType: any;
  studentID: any;
  courses: any[];

  constructor(private router: Router, private studentService: StudentService, private courseService: CourseService, private route: ActivatedRoute) {

  }

  ngOnInit() {
    swal({
      title: 'Loading...',
      allowOutsideClick: false
    });
    swal.showLoading();
    this.route.params.forEach((params: Params) => {
      if (params['courseID'] && params['instructorID'] && params['courseName']) {
        this.enrollMultiple = true;
        this.courseID = params['courseID'];
        this.instructorID = params['instructorID'];
        this.courseName = params['courseName'];
        this.getStudents();
      } else if (params['courseType'] && params['studentID']) {
        this.enrollMultiple = false;
        this.courseType = params['courseType'];
        this.studentID = params['studentID'];
        this.getStudentById(this.studentID);
      }
    });
  }

  getStudents() {
    this.studentService
      .getStudents()
      .then(result => {
        if ((result as any).result === 'error') {
          this.students = null;
          this.displayErrorAlert(result);
        } else {
          this.students = result;
          for (let student of this.students) {
            student.fullName = student.firstName + " " + student.lastName;
          }
          this.getTimetables();
        }
      }).catch(error => error);
  }

  getStudentById(id) {
    this.studentService
      .getStudent(id)
      .then(result => {
        if ((result as any).result === 'error') {
          this.student = null;
          this.displayErrorAlert(result);
        } else {
          this.student = result;
          this.getCourses();
        }
      }).catch(error => error);
  }

  getCourses() {
    this.courseService
      .getCourses()
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
        } else {
          this.courses = result;
          this.courses = this.courses.filter(x => x.courseType === this.courseType);
          this.getTimetables();
        }
      })
      .catch(error => error);
  }

  getTimetables() {
    this.studentService
      .getTimetables()
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
        } else {
          this.studentTimetables = result;
          this.compareTimetables();
        }
      })
      .catch(error => error);
  }

  compareTimetables() {
    if (this.students == null) {
      for (let course of this.courses) {
        var timetable = this.studentTimetables.filter(x => x.userID === (this.student as any).userID);
        for (let item of timetable) {
          var itemCourseID = item.courseID;
          if (itemCourseID === course.courseID) {
            course.enrolled = true;
          } else {
            course.enrolled = false;
          }
        }
      }
    } else {
      for (let student of this.students) {
        var timetable = this.studentTimetables.filter(x => x.userID === student.userID);
        for (let item of timetable) {
          var itemCourseID = item.courseID.toString();
          if (itemCourseID === this.courseID) {
            student.enrolled = true;
          }
        }
      }
    }
    this.loading = false;
    swal.close();
  }

  checkEnrolled(data) {
    if (this.students == null && data.enrolled) {
      swal({
        title: 'Remove ' + data.firstName + ' ' + data.lastName + ' from ' + this.courseName + '?',
        text: "",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove!'
      }).then(isConfirm => {
        if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
          console.log(isConfirm.dismiss);
        } else if (isConfirm) {
          this.drop(data);
        }
      }).catch(error => {
        console.log(error);
      });
    } else {
      this.enroll(data);
    }
  }

  enroll(data) {
    var startDate = moment(data.studentStartDate, "DDD MMM YYYY h:mm:ss LT").isValid();
    var endDate = moment(data.studentEndDate, "DDD MMM YYYY h:mm:ss LT").isValid();
    if (startDate && endDate) {
      if (this.students != null) {
        this.studentService
          .courseEnroll(data.userID, data.studentStartDate, data.studentEndDate, this.courseID, this.instructorID)
          .then(result => {
            if ((result as any).result === 'error') {
              this.displayErrorAlert(result);
            } else if ((result as any).result === 'success') {
              data.enrolled = true;
              swal(
                this.courseName,
                '' + data.firstName + ' ' + data.lastName + ' has been succesfully enrolled.',
                'success'
              );
            } else {
              swal(
                'Error',
                'Something went wrong while enrolling student.',
                'error'
              );
            }
          })
          .catch(error => error);
      } else {
        this.studentService
          .courseEnroll((this.student as any).userID, data.studentStartDate, data.studentEndDate, data.courseID, data.professorId)
          .then(result => {
            if ((result as any).result === 'error') {
              this.displayErrorAlert(result);
            } else if ((result as any).result === 'success') {
              this.courseService
                .removeFromWaitList((this.student as any).userID, data.courseType)
                .then(result => {
                  data.enrolled = true;
                  swal(
                    data.courseName,
                    '' + (this.student as any).firstName + ' ' + (this.student as any).lastName + ' has been succesfully enrolled.',
                    'success'
                  );
                }).catch(error => error);
            } else {
              swal(
                'Error',
                'Something went wrong while enrolling student.',
                'error'
              );
            }
          })
          .catch(error => error);
      }
    } else {
      swal(
        'Whoops',
        'Please input a valid start and end date for the student.',
        'warning'
      );
    }
  }

  drop(student: Student) {
    this.studentService
      .courseDrop(student.userID, this.courseID)
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
        } else if ((result as any).result === 'success') {
          student.enrolled = false;
        } else {
          swal(
            'Error',
            'Something went wrong, please try again.',
            'error'
          );
        }
      })
      .catch(error => error);
  }

  displayErrorAlert(error) {
    if (error.title === "Auth Error") {
      this.router.navigate(['/login']);
      swal(
        error.title,
        error.msg,
        'info'
      );
    } else {
      swal(
        error.title,
        error.msg,
        'error'
      );
    }
  }

  goBack() {
    window.history.back();
  }
}
