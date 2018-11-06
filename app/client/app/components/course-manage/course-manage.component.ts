import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from "../../services/course.service";
import { Course } from "../../models/course";
import { SelectItem } from 'primeng/primeng';
declare var swal: any;
declare var moment: any;

@Component({
  selector: 'courseManage',
  templateUrl: './app/components/course-manage/course-manage.component.html',
  styleUrls: ['./app/components/course-manage/course-manage.component.css']
})


export class CourseManageComponent implements OnInit {
  courses: Course[];
  error: any;
  Campus: string[];
  campusId: any;
  professors: any[] = [];
  courseType: string;
  showForm: boolean = false;
  //dropdown
  campuses: SelectItem[] = [{ label: ' -- All --', value: '' }];
  selectedCampusId: string;

  constructor(private router: Router, private CourseService: CourseService) {
  }

  ngOnInit() {
    swal({
      title: 'Loading...',
      allowOutsideClick: false
    });
    swal.showLoading();
    this.getInstructors();
    this.getCampuses();
    this.getCourses();
  }

  getCampuses() {
    this.CourseService
    .getCampuses()
    .then(res => {
      if ((res as any).result === "error") {
        this.displayErrorAlert(res);
      } else {
        res.forEach((i) => {
          this.campuses.push({
            label: i.campusName,
            value: i.campusId
          });
        });
      }

    });
  }

  getInstructors() {
    this.CourseService
    .getInstructors()
    .then((result) => {
      this.professors = result;
    });
  }

  getCourses() {
    this.CourseService
      .getCourses()
      .then(res => {
        if ((res as any).result === "error") {
          this.courses = null;
          this.displayErrorAlert(res);
        } else {
          //format datetime
          res.forEach((item) => {
            item.courseStart = moment(item.courseStart).utcOffset(60).format('YYYY-MM-DD');
            item.courseEnd = moment(item.courseEnd).utcOffset(60).format('YYYY-MM-DD');
          });
          this.courses = res;
          swal.close();
        }
      })
      .catch(error => this.error = error);
  }

  deleteAlert(course: Course, event: any) {
    swal({
      title: 'Delete course (' + course.courseName + ')?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(isConfirm => {
      if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
        console.log(isConfirm.dismiss);
      } else if (isConfirm) {
        this.deleteCourse(course, event);
      }
    }).catch(error => {
      console.log(error);
    });
  }

  deleteCourse(course: Course, event: any) {
    event.stopPropagation();
    this.CourseService
      .delete(course)
      .then(res => {
        if ((res as any).result === "error") {
          this.displayErrorAlert(res);
        } else if ((res as any).result === "success") {
          this.courses = this.courses.filter(h => h !== course);
          swal(
            'Deleted!',
            'Course record has been deleted.',
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

  gotoEdit(course: Course, event: any) {
    this.router.navigate(['/course-edit', course.courseID]);
  }

  addCourse() {
    this.router.navigate(['/course-edit', 'new']);
  }

  gotoStudentEnrollment(course: Course, event: any) {
    this.router.navigate(['/student-enrollment', course.courseID, course.professorId, course.courseName]);
  }

  filterCampus(cam) {
    this.campusId = this.Campus.indexOf(cam) + 1;
  }

  showCourseTypeForm() {
    this.showForm = true;
  }

  addCourseType() {
   if (this.courseType == null) {
      swal(
        'Invalid Input',
        'Please enter a name for the new course type.',
        'warning'
      );
    } else {
      swal({
        title: 'Saving...',
        allowOutsideClick: false
      });
      swal.showLoading();
      this.showForm = false;
      this.CourseService
        .addToCourseTypes(this.courseType)
        .then(result => {
          if ((result as any).result === 'error') {
            this.displayErrorAlert(result);
          } else if ((result as any).result === 'success')  {
            swal.close();
          } else {
            swal(
              'Error',
              'Something went wrong while adding new course type.',
              'error'
            );
          }
        })
        .catch(error => console.log("Error - Add new course type: " + error));
    }
  }

  closeMenu() {
    this.showForm = false;
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
