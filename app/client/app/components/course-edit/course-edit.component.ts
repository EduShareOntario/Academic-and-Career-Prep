import { Component, Input, OnInit } from '@angular/core';
import { Course } from "../../models/Course";
import { ActivatedRoute, Params } from '@angular/router';
import { CourseService } from "../../services/course.service";
import { SelectItem } from 'primeng/primeng';
declare var swal: any;
declare var moment;

@Component({
  selector: 'course-edit',
  templateUrl: './app/components/course-edit/course-edit.component.html',
  styleUrls: ['./app/components/course-edit/course-edit.component.css']
})


export class CourseEditComponent implements OnInit {
  //global variables
  @Input() course: Course;
  weekDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  newCourse = false;
  error: any;
  private sub: any;
  id: any;
  weekDay: string;
  idGen: number = 100;
  // calendar
  events: any[] = [];
  event: MyEvent;
  header: any;
  options: any;
  selectedDays: string[] = [];
  // pop up
  dialogVisible: boolean = false;
  // drop down
  courseTypes: SelectItem[] = [{ label: '-- select --', value: '' }];
  professors: SelectItem[] = [{ label: '-- select --', value: '' }];
  campuses: SelectItem[] = [{ label: '-- select --', value: '' }];

  constructor(private courseService: CourseService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscribeCourse();

    // get instructors
    this.courseService.getInstructors()
    .then((result) => {
      if ((result as any).result === "error") {
        this.displayErrorAlert(result);
      } else {
        result.forEach((i) => {
          this.professors.push({
            label: i.professorName,
            value: i.userID
          });
        });
      }
    });

    // get campuses
    this.courseService.getCampuses()
    .then((result) => {
      if ((result as any).result === "error") {
        this.displayErrorAlert(result);
      } else {
        result.forEach((i) => {
          this.campuses.push({
            label: i.campusName,
            value: i.campusId
          });
        });
      }
    });

    // get course types
    this.courseService.getCourseTypes()
    .then((result) => {
      if ((result as any).result === "error") {
        this.displayErrorAlert(result);
      } else {
        result.forEach((i) => {
          this.courseTypes.push({
            label: i.courseType,
            value: i.courseType
          });
        });
      }
    });

    this.header = {
      left: 'prev',
      center: 'title',
      right: 'next'
    };

    this.options = {
      prev: 'circle-triangle-w',
      defaultView: "month",
      height: "auto",
      selectable: true,
      displayEventEnd: true
    };

  } // end of init

  // check boxes onchange event
  cb_onchange(e, weekday) {
    if (e) {
      if (this.course.courseStart === undefined || this.course.courseEnd === undefined || this.course.courseStart === null || this.course.courseEnd == null) {
        swal(
          'Whoops!',
          'Please pick a course start/end date first.',
          'warning'
        );
        this.unCheck(weekday); // unselect element
      } else {
        this.weekDay = weekday;
        this.event = new MyEvent();
        this.event.type = "batchGen";
        this.dialogVisible = true;
      }
    } else {
      this.events = this.events.filter(result => result.weekday !== weekday);
    }
  }

  // this function will uncheck checkbox based on week day that given
  unCheck(weekday) {
    this.selectedDays = this.selectedDays.filter(result => result !== weekday);
  }

  // this function will generate days that maches specification
  private generateDays(weekday, start_date, end_date) {

    // figure out what's next week day
    let momentIndex, nextDay;
    for (let i = 0; i < this.weekDays.length; i++) {
      if (this.weekDays[i] === weekday) {
        momentIndex = i + 1;
      }
    }
    if (moment(start_date).isoWeekday() > momentIndex) {
      nextDay = moment(start_date).isoWeekday(momentIndex + 7);
    } else {
      nextDay = moment(start_date).isoWeekday(momentIndex);
    }
    let root = 0, tempStart, tempEnd;
    tempStart = this.event.dayStart;
    tempEnd = this.event.dayEnd;
    while (!(moment(nextDay).add(7 * root, 'day')).isAfter(moment(end_date))) {
      this.event = new MyEvent();
      this.event.id = this.idGen++;
      this.event.dayStart = tempStart;
      this.event.dayEnd = tempEnd;
      this.event.weekday = weekday;
      this.event.title = moment(nextDay).add(7 * root, 'day').format('YYYY-MM-DD');
      this.event.dayStart_correct = moment(tempStart).isValid() ? moment(tempStart).format('HH:mm') : '';
      this.event.dayEnd_correct = moment(tempEnd).isValid() ? moment(tempEnd).format('HH:mm') : '';
      this.event.start = moment(nextDay).add(7 * root, 'day').format('YYYY-MM-DD') + ' ' + this.event.dayStart_correct;
      this.event.end = moment(nextDay).add(7 * root, 'day').format('YYYY-MM-DD') + ' ' + this.event.dayEnd_correct;
      this.events.push(this.event);
      root++;
    }
  }

  saveEvent() {
    if (this.event.type === 'add') {

      let momentIndex = -1;
      for (let i = 0; i < this.weekDays.length; i++) {
        if (i === moment(this.event.title).isoWeekday()) {
          momentIndex = i - 1;
        }
      }
      this.event.weekday = this.weekDays[momentIndex];
      this.event.id = this.idGen++;  // title, id , weekday,dayStart,dayEn
      this.event.dayStart_correct = moment(this.event.dayStart).isValid() ? moment(this.event.dayStart).format('HH:mm') : '';
      this.event.dayEnd_correct = moment(this.event.dayEnd).isValid() ? moment(this.event.dayEnd).format('HH:mm') : '';
      this.event.start = this.event.title + ' ' + this.event.dayStart_correct;
      this.event.end = this.event.title + ' ' + this.event.dayEnd_correct;
      if (this.checkExist(this.event.title)) {
        this.events.push(this.event);
      } else {
        alert('event exist');
      }

    } else if (this.event.type === 'edit') {

      if (this.event.id) {
        this.event.dayStart_correct = moment(this.event.dayStart).isValid() ? moment(this.event.dayStart).format('HH:mm') : '';
        this.event.dayEnd_correct = moment(this.event.dayEnd).isValid() ? moment(this.event.dayEnd).format('HH:mm') : '';
        this.event.start = this.event.title + ' ' + this.event.dayStart_correct;
        this.event.end = this.event.title + ' ' + this.event.dayEnd_correct;

        let index: number = this.findEventIndexById(this.event.id);

        if (index >= 0) {
          this.events[index] = this.event;
        }
      }
    } else if (this.event.type === 'batchGen') {

      this.generateDays(this.weekDay, this.course.courseStart, this.course.courseEnd);
    }

    this.dialogVisible = false;
    this.event = null;
  }

  deleteEvent() {
    let index: number = this.findEventIndexById(this.event.id);
    if (index >= 0) {
      this.events.splice(index, 1);
    }
    this.dialogVisible = false;
  }

  findEventIndexById(id: number) {
    let index = -1;
    for (let i = 0; i < this.events.length; i++) {
      if (id === this.events[i].id) {
        index = i;
        break;
      }
    }
    return index;
  }

  // event handler for event click
  handleEventClick(e) {
    this.event = new MyEvent();
    this.event.type = 'edit';
    this.event.title = e.calEvent.title;
    this.event.dayStart = e.calEvent.dayStart;
    this.event.dayEnd = e.calEvent.dayEnd;
    this.event.start = e.calEvent.start;
    this.event.end = e.calEvent.end;
    this.event.id = e.calEvent.id;
    this.event.weekday = e.calEvent.weekday;
    this.dialogVisible = true;
    // this.events = this.events.filter(result => result !== event );
  }

  // event handler for day click
  handleDayClick(e) {
    let date = e.date.format();
    this.event = new MyEvent();
    this.event.title = date;
    this.event.type = "add";
    this.dialogVisible = true;
  }

  checkExist(date) {
    let ndate = this.events.filter(result => result.start === date);
    if (ndate.length === 1) { // if found event exist then return false to prevent new arry.push
      return false;
    } else {
      return true;
    }
  }

  subscribeCourse() {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      if (this.id === 'new') {
        this.newCourse = true;
        this.course = new Course();
      } else {
        this.newCourse = false;
        this.courseService.getCourse(this.id).then((result) => {
          if ((result as any).result === "error") {
            this.displayErrorAlert(result);
          } else {
            result.forEach((item) => {
              item.courseStart = moment(item.courseStart).isValid() ? moment(item.courseStart).add(1, 'day').format('YYYY-MM-DD ') : '';
              item.courseEnd = moment(item.courseEnd).isValid() ? moment(item.courseEnd).add(1, 'day').format('YYYY-MM-DD') : '';
            });
            this.course = result[0];
            if (this.course.classTimeStr !== null) {
              this.events = this.detachCourseStr(this.course.classTimeStr);
            }
          }
        });
      }
    });
  }

  detachCourseStr(str) { // temp solution
    let myEvents = [];
    let strArry = str.split(',');
    strArry.forEach(element => {
      let myEvent = new MyEvent();
      myEvent.title = element.split(' ')[0];
      myEvent.id = this.idGen++;
      myEvent.weekday = this.weekDays[moment(myEvent.title).isoWeekday() - 1];
      myEvent.dayStart_correct = element.split(' ')[1].split('-')[0];
      myEvent.dayEnd_correct = element.split(' ')[1].split('-')[1];
      myEvent.start = element.split(' ')[0] + ' ' + myEvent.dayStart_correct;
      myEvent.end = element.split(' ')[0] + ' ' + myEvent.dayEnd_correct;
      myEvent.dayStart = moment(myEvent.start).isValid() ? moment(myEvent.start).format() : '';
      myEvent.dayEnd = moment(myEvent.end).isValid() ? moment(myEvent.end).format() : '';
      myEvent.allDay = false;
      myEvents.push(myEvent);
    });
    return myEvents;
  }

  generateClassTimeStr() {
    let str = '', tempStart, tempEnd, tempDate;
    for (let i = 0; i < this.events.length; i++) {
      tempDate = this.events[i].title;
      tempStart = this.events[i].dayStart_correct;
      tempEnd = this.events[i].dayEnd_correct;
      if (i === 0) {
        str += `${tempDate} ${tempStart}-${tempEnd}`;
      } else {
        str += `,${tempDate} ${tempStart}-${tempEnd}`;
      }
    }
    return str;
  }

  save() {
    this.course.classTimeStr = this.generateClassTimeStr();
    if (!this.course.courseName
      || !this.course.courseStart
      || !this.course.courseEnd
      || !this.course.professorId
      || !this.course.campusId
      || !this.course.classroom
      || !this.course.classTimeStr
      || !this.course.courseType) {
      swal(
        'Form Incomplete',
        'Please fill out all fields in the form.',
        'warning'
      );
    } else {
      //**** need validation
      if (this.id === 'new') {
        this.courseService
          .create(this.course)
          .then(course => {
            if ((course as any).result === "error") {
              this.displayErrorAlert(course);
            } else if ((course as any).result === "success") {
              swal(
                (course as any).title,
                (course as any).msg,
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
        this.courseService
          .update(this.course)
          .then(course => {
            if ((course as any).result === "error") {
              this.displayErrorAlert(course);
            } else if ((course as any).result === "success") {
              swal(
                (course as any).title,
                (course as any).msg,
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
      }

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

export class MyEvent {
  id: number;
  type: string;
  title: string;
  dayStart: string;
  dayEnd: string;
  dayStart_correct: string;
  dayEnd_correct: string;
  start: string;
  end: string;
  weekday: string;
  allDay: boolean;
}
