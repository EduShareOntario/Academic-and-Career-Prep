import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Course } from "../../models/course";
import { Student } from "../../models/Student";
import { StudentService } from "../../services/student.service";
import { CourseService} from '../../services/course.service';
declare var moment: any;
declare var swal: any;

@Component({
  selector: 'timetable',
  templateUrl: './app/components/timetable/timetable.component.html',
  styleUrls: ['./app/components/timetable/timetable.component.css']
})

export class TimetableComponent implements OnInit {
  @Input() student: Student;
  events: any[] = [];
  header: any;
  options: any;
  students: Student [];
  selectedStudent: Student [];
  studentSearchQuery: String;
  faculty: boolean = false;
  validInfo: boolean = false;

  constructor(private router: Router, private studentService: StudentService, private courseService:CourseService, private route: ActivatedRoute) {

  }

  ngOnInit() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    var userID = currentUser.userID;

    if (currentUser.userType !== "Student") {
      this.faculty = true;
      this.studentService
          .getStudents()
          .then(students => {
              this.students = students;
          })
          .catch(error => {
            // do something
          });

      swal({
          title: 'Timetable',
          text: 'Enter a student name',
          input: "text",
          inputPlaceholder: "Student Name",
          showCancelButton: true,
          animation: "slide-from-top",
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false,
          confirmButtonText: 'Continue',
          cancelButtonText: 'Back to Dashboard'
      }).then(isConfirm => {
        if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
          console.log(isConfirm.dismiss);
          this.router.navigate(['/dashboard']);
        } else if (isConfirm) {
          this.studentSearchQuery = isConfirm.value;
          var name = this.studentSearchQuery.split(" ");
          var firstName = name[0];
          var lastName = name[1];
          if (firstName == null || lastName == null) {
            this.alert();
          } else {
            try {
              this.selectedStudent = this.students.filter(x => x.firstName === firstName && x.lastName === lastName);
              this.getEventsById(this.selectedStudent[0].userID);
              this.validInfo = true;
            } catch (e) {
              this.alert();
            }
          }
        } else {
          this.alert();
        }
      }).catch(error => {
        console.log(error);
      });

    } else {
      this.getEventsById(userID);
    }

    this.options = {
      selectable: true,
      prev: 'circle-triangle-w',
      defaultView: "agendaWeek",
      minTime: "08:00:00",
      maxTime: "22:00:00",
      height: "auto"
    };
  }

  alert() {
    this.validInfo = false;
    swal({
        title: 'Timetable',
        text: 'Enter a valid student name',
        input: "text",
        type: 'warning',
        inputPlaceholder: "Student Name",
        showCancelButton: true,
        animation: "slide-from-top",
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false,
        confirmButtonText: 'Continue',
        cancelButtonText: 'Back to Dashboard'
    }).then(isConfirm => {
      if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
        console.log(isConfirm.dismiss);
        this.router.navigate(['/dashboard']);
      } else if (isConfirm) {
        this.studentSearchQuery = isConfirm.value;
        var name = this.studentSearchQuery.split(" ");
        var firstName = name[0];
        var lastName = name[1];
        if (firstName == null || lastName == null) {
          this.alert();
        } else {
          this.events = [];
          try {
            this.selectedStudent = this.students.filter(x => x.firstName === firstName && x.lastName === lastName);
            this.getEventsById(this.selectedStudent[0].userID);
            this.validInfo = true;
          } catch (e) {
            this.alert();
          }
        }
      } else {
        this.alert();
      }
    }).catch(error => {
      console.log(error);
    });
  }

  getEventsById(userID) {
    this.studentService.getEventsById(userID).then(result => {
      result.forEach((i) => {
        var classDay = 0;

        if (i.classDay === "Monday") {
          classDay = 1;
        } else if (i.classDay === "Tuesday") {
          classDay = 2;
        } else if (i.classDay === "Wednesday") {
          classDay = 3;
        } else if (i.classDay === "Thursday") {
          classDay = 4;
        } else if (i.classDay === "Friday") {
          classDay = 5;
        }

        i.courseStart = moment(i.courseStart).format('YYYY-MM-DD');
        i.courseEnd = moment(i.courseEnd).format('YYYY-MM-DD');
        i.classStartTime = moment(i.classStartTime).format('hh:mm A');
        i.classEndTime = moment(i.classEndTime).format('hh:mm A');

        if (i.classTimeStr) {
          var array = i.classTimeStr.split(',');
          for (let item of array) {
            var date = item.split(' ');
            var day = date[0];
            var time = date[1];
            var startTime = time.split('-')[0];
            var endTime = time.split('-')[1];
            this.events.push(
              {
                "title": i.courseName,
                "start": day + "T" + startTime,
                "end": day + "T" + endTime
              });
          }
        } else {
          console.log("No class date string available");
        }
      });
    }).catch(error => {
      console.log("Error getting events by id");
    });
  }

  goBack() {
    window.history.back();
  }
}
