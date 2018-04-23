import { Component, Input, OnInit } from '@angular/core';
import { User } from "../../models/User";
import { ActivatedRoute, Params } from '@angular/router';
import { StaffService } from "../../services/staff.service";
declare var swal: any;

@Component({
  selector: 'staff-edit',
  templateUrl: './app/components/staff-details/staff-details.component.html',
  styleUrls: ['./app/components/staff-details/staff-details.component.css']
})

export class StaffDetailsComponent implements OnInit {
  @Input() user: User;
  newUser = false;
  error: any;
  navigated = false; // true if navigated here
  authLevels: any;
  fselected: any[] = [];
  id: any;

  constructor(private staffService: StaffService, private route: ActivatedRoute) {

  }

  ngOnInit() {
    //SelectItem API with label-value pairs
    this.authLevels = [
      { label: 'Admin', value: 'Admin' },
      { label: 'Staff', value: 'Staff' },
      { label: 'Instructor', value: 'Instructor' }
    ];
    this.route.params.forEach((params: Params) => {
      this.id = params['id'];
      if (this.id === 'new') {
        this.newUser = true;
        this.user = new User();
        this.user.notify = true;
      } else {
        this.newUser = false;
        this.staffService
          .getUser(this.id)
          .then(user => {
            if ((user as any).result === "error") {
              this.displayErrorAlert((user as any));
            } else {
              this.user = user;
              for (let item of this.user.userType.split(',')) {
                this.fselected.push(item);
              }
            }
          });
      }
    });
  }

  save() {
    if (this.newUser === true) {
      if (this.user.email
        && this.user.firstName
        && this.user.lastName
        && this.fselected.toString() !== '') {
        this.user.userType = this.fselected.toString();
        this.staffService
          .saveNew(this.user)
          .then(user => {
            if ((user as any).result === "error") {
              this.displayErrorAlert((user as any));
            } else if ((user as any).msg === "Username is already in use.") {
              swal(
                'Username taken',
                'Please enter a different username.',
                'warning'
              );
            } else if ((user as any).msg === "Email is already in use.") {
              swal(
                'Email in use',
                'Please enter a different email.',
                'warning'
              );
            } else if ((user as any).msg === "Incorrect email format.") {
              swal(
                'Incorrect email format',
                'Please enter a proper email.',
                'warning'
              );
            } else if ((user as any).result === "success") {
              swal(
                (user as any).title,
                (user as any).msg,
                'success'
              );
              this.goBack();
            } else {
              swal(
                  'Error',
                  'Something went wrong, please try again.',
                  'error'
              );
            }
          })
          .catch(error => this.error = error); // TODO: Display error message
      } else {
        swal(
          'Missing Input',
          'Please enter all information before saving.',
          'warning'
        );
      }
    } else {
      if (this.user.email
        && this.fselected) {
        this.user.userType = this.fselected.toString();
        this.staffService
          .update(this.user, this.id)
          .then(user => {
            if ((user as any).result === "error") {
              this.displayErrorAlert((user as any));
            }  else if ((user as any).msg === "Username is already in use.") {
              swal(
                'Username taken',
                'Please enter a different username.',
                'warning'
              );
            } else if ((user as any).msg === "Email is already in use.") {
              swal(
                'Email in use',
                'Please enter a different email.',
                'warning'
              );
            } else if ((user as any).msg === "Incorrect email format.") {
              swal(
                'Incorrect email format',
                'Please enter a proper email.',
                'warning'
              );
            } else if ((user as any).result === "success") {
              swal(
                (user as any).title,
                (user as any).msg,
                'success'
              );
              this.goBack();
            } else {
              swal(
                  'Error',
                  'Something went wrong, please try again.',
                  'error'
              );
            }
          })
          .catch(error => this.error = error); // TODO: Display error message
      } else {
        swal(
          'Missing Input',
          'Please enter all information before saving.',
          'warning'
        );
      }
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
