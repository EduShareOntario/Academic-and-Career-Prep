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
    selector: 'attendanceList',
    templateUrl: './app/components/attendance-list/attendance-list.component.html',
    styleUrls: ['./app/components/attendance-list/attendance-list.component.css']
})

export class AttendanceListComponent implements OnInit {
    data: any;
    date: any;
    courseID: any;
    attendanceView: boolean = false;
    loading: boolean = false;
    attendanceCourse: any;
    attendanceStudents: any;
    timetables: any;
    attendance: any;
    absentStudents = [];
    attendanceDates: any[] = [];
    previousAttendance: any;
    instructors: any;
    instructorOptions: any = {};
    selectedInstructor: number;

    constructor(private router: Router, private CourseService: CourseService, private StudentService: StudentService, private StaffService: StaffService) {
      this.date = new Date();
    }

    ngOnInit() {
      swal({
        title: 'Loading...',
        allowOutsideClick: false
      });
      swal.showLoading();
      var currentUser = JSON.parse(localStorage.getItem('currentUser'));
      var userID = currentUser.userID;
      if (currentUser.userType !== 'Instructor') {
        this.StaffService
            .getUsers()
            .then(instructors => {
                this.instructors = instructors.filter(x => x.userType === 'Instructor');
            })
            .catch(error => {
              // do something
            });
            swal.close();
      } else {
        this.getCourses(userID);
        this.StudentService
            .getAllAttendance()
            .then(attendance => {
                if (attendance.status === "403") {
                    this.previousAttendance = null;
                } else {
                    this.previousAttendance = attendance;
                    for (let item of this.previousAttendance) {
                      item.date = item.date[0] + " " + item.date[1];
                    }
                }
            })
            .catch(error => console.log(error));
            swal.close();
      }
    }

    instructorSelect() {
      this.attendanceDates = [];
      this.attendanceView = null;
      swal({
        title: 'Loading...',
        allowOutsideClick: false
      });
      swal.showLoading();
      this.getCourses(this.selectedInstructor);
      this.StudentService
          .getAllAttendance()
          .then(attendance => {
              if (attendance.status === "403") {
                  this.previousAttendance = null;
              } else {
                  this.previousAttendance = attendance;
                  for (let item of this.previousAttendance) {
                    item.date = item.date[0] + " " + item.date[1];
                  }
              }
              swal.close();
          })
          .catch(error => console.log(error));
    }

    getCourses(instructorID) {
        this.CourseService
            .getInstructorCourses(instructorID)
            .then(result => {
                var isEmpty = (result || []).length === 0;
                if (isEmpty || result.status === "403") {
                    console.log(result);
                    this.data = null;
                } else {
                    this.data = result;
                }
            })
            .catch(error => console.log(error));
    }

    doAttendance(course: Course) {
      this.attendanceDates = [];
      swal({
        title: 'Loading...',
        allowOutsideClick: false
      });
      swal.showLoading();
      this.previousAttendance = this.previousAttendance.filter(x => x.courseID === course.courseID);
      this.courseID = course.courseID;
      this.StudentService
          .getTimetablesByCourseId(course.courseID)
          .then(result => {
              var isEmpty = (result || []).length === 0;
              if (isEmpty || result.status === "403") {
                  this.timetables = null;
                  this.attendanceStudents = null;
                  swal.close();
              } else {
                  this.timetables = result;
                  this.getStudentsById(this.timetables);
              }
          })
          .catch(error => console.log(error));

      this.attendanceCourse = course;
      var array = this.attendanceCourse.classTimeStr.split(',');
      for (let item of array) {
        var attendanceHistory = this.previousAttendance;
        attendanceHistory = attendanceHistory.filter(x => x.date === item);
        if (attendanceHistory.length !== 0) {
          console.log("Attendance already taken");
        } else {
          var date = item.split(' ');
          var formattedDate = moment(date[0]).format("ddd, MMM Do YYYY");
          var list = {
            label: formattedDate + ' from ' + date[1],
            value: date[0] + ' ' + date[1]
          };
          this.attendanceDates.push(list);
        }
      }
      this.attendanceView = true;
    }

    getStudentsById(timetables) {
      console.log(timetables);
      this.StudentService
          .getStudentsById(timetables)
          .then(result => {
              var isEmpty = (result || []).length === 0;
              if (isEmpty || result.status === "error") {
                  this.attendanceStudents = null;
              } else {
                  this.attendanceStudents = result;
                  for (let student of this.attendanceStudents) {
                    student.fullName = student.firstName + " " + student.lastName;
                  }
              }
              swal.close();
          })
          .catch(error => console.log(error));
    }

    // markAbsent(student: Student) {
    //   if (student.absent) {
    //     student.absent = false;
    //     var index = this.absentStudents.indexOf(student.studentID);
    //     this.absentStudents.splice(index, 1);
    //   } else {
    //     student.absent = true;
    //     this.absentStudents.push(student.studentID);
    //   }
    //   console.log(this.absentStudents);
    // }

    submitAttendance() {
      var count = 0;
      for (let student of this.attendanceStudents) {
        if (student.attendanceValue) {
          count++;
        }
      }

      if (!this.attendanceCourse.attendanceDate) {
        console.log(this.attendanceCourse);
        swal(
            'Attendance Incomplete',
            'Please enter an attendance date',
            'warning'
        );
      } else if (count === this.attendanceStudents.length && this.attendanceCourse.attendanceDate) {
        swal({
            title: 'Submit Attendance?',
            text: "You won't be able to revert this!",
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, submit!'
        }).then(isConfirm => {
          if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
            console.log(isConfirm.dismiss);
          } else if (isConfirm) {
            this.attendance = {
              students: this.attendanceStudents,
              courseID: this.courseID,
              date: this.attendanceCourse.attendanceDate
            };
            this.StudentService
                .insertAttendance(this.attendance)
                .then(result => {
                  swal(
                      'Attendance submitted!',
                      '',
                      'success'
                  );
                  this.attendanceView = false;
                  this.router.navigate(['/attendance-report']);
                })
                .catch(error => console.log(error));
          }
        }).catch(error => {
          console.log(error);
        });
      } else {
        swal(
            'Attendance Incomplete',
            'Please enter attendance for all students',
            'warning'
        );
      }

    }

    goBack() {
        window.history.back();
    }
}
