import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Course } from "../../models/course";
import { Student } from "../../models/student";
import { Client } from "../../models/client";
import { CourseService } from "../../services/course.service";
import { StudentService } from "../../services/student.service";
import { ClientService } from "../../services/client.service";
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
  clients: Client[];
  users: any = [];
  courseTypes: any[];
  waitList: any[];
  timetables: any[];
  courseWaitList: any[];
  usersWaiting:any = [];
  viewingCourse: Course[];
  selectedCourseType: Course[];
  selectedUser: any[];
  showForm: boolean = false;

  constructor(private router: Router, private CourseService: CourseService, private StudentService: StudentService, private ClientService: ClientService, private StaffService: StaffService) {

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
            this.users.push(student);
          }
          this.getClients();
        }
      })
      .catch(error => console.log("Error - Get students: " + error));
  }

  getClients() {
    this.ClientService
      .getClients()
      .then(clients => {
        if ((clients as any).result === 'error') {
          this.clients = null;
          this.displayErrorAlert(clients);
        } else {
          this.clients = (clients as any).clients;
          for (let client of this.clients) {
            client.fullName = client.firstName + " " + client.lastName;
            this.users.push(client);
          }
          this.getCourses();
        }
      })
      .catch(error => console.log("Error - Get clients: " + error));
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
    this.usersWaiting = [];
    this.CourseService
      .getWaitList()
      .then(result => {
        if ((result as any).result === 'error') {
          this.waitList = null;
          this.displayErrorAlert(result);
        } else {
          this.waitList = result;
          for (let item of this.waitList) {
             var user = this.users.filter(x => x.userID === item.userID);
             //student[0].fullName = student[0].firstName + " " + student[0].lastName;
             // student[0].courseID = course[0].courseID;
             // student[0].professorId = course[0].professorId;
             if (user[0] != null) {
               if (user[0].studentID != null) {
                 var userType = "Student";
               } else {
                 var userType = "Client";
               }
               user[0].courseName = item.courseType;
               var userRecord = {
                 id: user[0].userID,
                 userType: userType,
                 fullName: user[0].fullName,
                 courseType: item.courseType,
                 date: item.date
               };
               this.usersWaiting.push(userRecord);
             }
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
   if (this.selectedUser == null || this.selectedCourseType == null) {
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
        .addToWaitList(this.selectedUser, this.selectedCourseType, CurrentDate)
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

  removeFromWaitList(data) {
    this.CourseService
      .removeFromWaitList(data.id, data.courseType)
      .then(result => {
        this.getWaitList();
        swal(
          'Removed from ' + data.courseType,
          '' + data.fullName + ' has been succesfully removed from the ' + data.courseType + ' wait list.',
          'success'
        );
      }).catch(error => error);
  }

  closeMenu() {
    this.showForm = false;
  }

  gotoStudentEnrollment(data, event: any) {
    this.router.navigate(['/student-enrollment', data.courseType, data.id ]);
  }

  viewCourseWaitList(data) {
    this.viewingCourse = data;
    this.usersWaiting = [];
    this.courseWaitList = this.waitList.filter(x => x.courseType === data.courseType);
    for (let item of this.courseWaitList) {
       var user = this.users.filter(x => x.userID === item.userID);
       if (user[0] != null) {
         user[0].fullName = user[0].firstName + " " + user[0].lastName;
         if (user[0].studentID != null) {
           var userType = "Student";
         } else {
           var userType = "Client";
         }
         var userRecord = {
           id: user[0].userID,
           fullName: user[0].fullName,
           userType: userType,
           courseType: item.courseType,
           date: item.date
         };
         this.usersWaiting.push(userRecord);
       }
    }
  }

  onPrint() {
    (window as any).print();
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
