import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from "../../services/student.service";
declare var swal: any;
declare var moment;

@Component({
  selector: 'studentArchive',
  templateUrl: './app/components/student-archive/student-archive.component.html',
  styleUrls: ['./app/components/student-archive/student-archive.component.css']
})

export class StudentArchiveComponent implements OnInit {
  archive: any;

  constructor(private router: Router, private studentService: StudentService) {

  }

  ngOnInit() {
    swal({
      title: 'Loading...',
      allowOutsideClick: false
    });
    swal.showLoading();
    this.getStudentArchive();
    //this.getTimetables();
  }

  getStudentArchive() {
    this.studentService
      .getStudentArchive()
      .then(results => {
        if ((results as any).result === 'error') {
          this.archive = null;
          this.displayErrorAlert(results);
        } else {
          this.archive = results;
          swal.close();
        }
      })
      .catch(error => console.log("Error - Get student archive: " + error));
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
