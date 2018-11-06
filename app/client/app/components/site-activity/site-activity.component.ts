import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StaffService } from "../../services/staff.service";
declare var swal: any;
declare var moment;

@Component({
  selector: 'waitList',
  templateUrl: './app/components/site-activity/site-activity.component.html',
  styleUrls: ['./app/components/site-activity/site-activity.component.css']
})

export class SiteActivityComponent implements OnInit {
  activity: any;

  constructor(private router: Router, private StaffService: StaffService) {

  }

  ngOnInit() {
    swal({
      title: 'Loading...',
      allowOutsideClick: false
    });
    swal.showLoading();
    this.getSiteActivity();
    //this.getTimetables();
  }

  getSiteActivity() {
    this.StaffService
      .getSiteActivity()
      .then(results => {
        if ((results as any).result === 'error') {
          this.activity = null;
          this.displayErrorAlert(results);
        } else {
          this.activity = results;
          swal.close();
        }
      })
      .catch(error => console.log("Error - Get activity: " + error));
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
