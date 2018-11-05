import { Component, OnInit } from '@angular/core';
import { StaffService } from "../../services/staff.service";
import { StudentService } from "../../services/student.service";
import { User } from "../../models/user";
import { Router } from '@angular/router';
declare var swal: any;


@Component({
    selector: 'staff-manage',
    templateUrl: './app/components/staff-manage/staff-manage.component.html',
    styleUrls: ['./app/components/staff-manage/staff-manage.component.css']
})


export class StaffManageComponent implements OnInit {
    users: User[];
    usersBackup: User[];
    error: any;
    usersLength: any;
    adminNumber: any;
    staffNumber: any;
    instructorNumber: any;

    constructor(private router: Router, private staffService: StaffService, private studentService: StudentService) {

    }

    ngOnInit() {
      swal({
        title: 'Loading...',
        allowOutsideClick: false
      });
      swal.showLoading();
      this.getUsers();
    }

    getUsers() {
        this.staffService
          .getUsers()
          .then(users => {
            if ((users as any).result === "error") {
              this.users = null;
              this.displayErrorAlert((users as any));
            } else {
              this.users = users;
              for (let user of this.users) {
                user.fullName = user.firstName + " " + user.lastName;
              }
              this.usersBackup = this.users;
              this.usersLength = users.length;
              this.updateStats();
            }
          })
          .catch(error => this.error = error);
    }

    runAttendanceCheck() {
        this.studentService
          .manualAttendanceCheck()
          .then(result => {
            if ((result as any).result === "error") {
              this.displayErrorAlert((result as any));
            } else {
              swal(
                  result.title,
                  result.msg,
                  'success'
              );
            }
          })
          .catch(error => this.error = error);
    }

    gotoEdit(user: User, event: any) {
        this.router.navigate(['/staff-details', user.userID]);
    }

    addUser() {
        this.router.navigate(['/staff-details', 'new']);
    }

    deleteAlert(user: User, event: any) {
        swal({
            title: 'Delete ' + user.firstName + ' ' + user.lastName + '?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete!'
        }).then(isConfirm => {
          if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
            console.log(isConfirm.dismiss);
          } else if (isConfirm) {
            this.deleteUser(user, event);
          }
        }).catch(error => {
          console.log(error);
        });
    }

    deleteUser(user: User, event: any) {
        event.stopPropagation();
        this.staffService
          .delete(user)
          .then(res => {
            console.log(res);
            if ((res as any).result === "error") {
              this.displayErrorAlert((res as any));
            } else if ((res as any).result === "success") {
              this.users = this.users.filter(h => h !== user);
              this.usersBackup = this.users;
              this.usersLength = this.users.length;
              this.updateStats();
              swal(
                  'Deleted!',
                  'User has been deleted.',
                  'success'
              );
            } else {
              swal(
                  'Error',
                  'Something went wrong, please try again.',
                  'error'
              );
            }
          })
          .catch(error => this.error = error);
    }

    updateStats() {
      this.adminNumber = this.users.filter(x => x.userType.indexOf("Admin") !== -1);
      this.adminNumber = this.adminNumber.length;
      this.staffNumber = this.users.filter(x => x.userType.indexOf("Staff") !== -1);
      this.staffNumber = this.staffNumber.length;
      this.instructorNumber = this.users.filter(x => x.userType.indexOf("Instructor") !== -1);
      this.instructorNumber = this.instructorNumber.length;
      swal.close();
    }

    filterStaff(userType) {
      this.users = this.usersBackup;
      if (userType === 'total') {
        this.users = this.usersBackup;
      } else {
        this.users = this.users.filter(x => x.userType.indexOf(userType) !== -1);
      }
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
