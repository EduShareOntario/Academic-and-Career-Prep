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
  courseTypes: any[];
  waitList: any[];
  timetables: any[];
  courseWaitList: any[];
  studentsWaiting:any = [];
  viewingCourse: Course[];
  selectedCourseType: Course[];
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
      .getCourseTypes()
      .then(result => {
        if ((result as any).result === 'error') {
          this.courseTypes = null;
          this.displayErrorAlert(result);
        } else {
          this.courseTypes = result;
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
             //student[0].fullName = student[0].firstName + " " + student[0].lastName;
             // student[0].courseID = course[0].courseID;
             // student[0].professorId = course[0].professorId;
             student[0].courseName = item.courseType;
             var studentRecord = {
               fullName: student[0].fullName,
               courseType: student[0].courseName,
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
   if (this.selectedStudent == null || this.selectedCourseType == null) {
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
        .addToWaitList(this.selectedStudent, this.selectedCourseType, CurrentDate)
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
    this.courseWaitList = this.waitList.filter(x => x.courseType === data.courseType);
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
