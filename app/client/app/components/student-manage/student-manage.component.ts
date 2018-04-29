import { Component, OnInit, NgZone } from '@angular/core';
import { Student } from "../../models/student";
import { Course } from "../../models/course";
import { ConsentForm } from "../../models/consentForm";
import { SuitabilityForm } from "../../models/suitabilityForm";
import { LearningStyleForm } from "../../models/learningStyleForm";
import { Router } from '@angular/router';
import { StudentService } from "../../services/student.service";
import { AuthService } from "../../services/authentication.service";
import { FilesService } from "../../services/files.service";
declare var swal: any;
declare var FileSaver: any;

@Component({
  selector: 'student-manage',
  templateUrl: './app/components/student-manage/student-manage.component.html',
  styleUrls: ['./app/components/student-manage/student-manage.component.css']
})

export class StudentManageComponent implements OnInit {
  students: Student[];
  error: any;
  studentInfoView: boolean = false;
  studentView: Student;
  studentCoursesView: Student;
  studentCourses: any[];
  consentForms: ConsentForm[];
  consentView: ConsentForm;
  selectedConsentForm: string;
  suitabilityView: SuitabilityForm;
  learningStyleView: LearningStyleForm;

  showGeneral: boolean = true;
  studentEdit: Student;
  showGeneralInfoEdit: boolean = false;
  showSuitability: boolean;
  showConsent: boolean;
  showLearningStyle: boolean;
  showFiles: boolean;

  //bar chart (learning style)
  barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  barChartLabels: string[] = ['Hearing', 'Seeing', 'Doing'];
  barChartType: string = 'bar';
  barChartLegend: boolean = false;
  barChartData: any;
  barChartColors: any[] = [{ backgroundColor: ["#FF4207", "#F8E903", "#2AD308"] }];

  files: any[];
  studentsFiles: any[];

  constructor(private router: Router, private ngZone: NgZone, private studentService: StudentService, private authService: AuthService, private filesService: FilesService) {

  }

  ngOnInit() {
    this.getStudents();
    this.getFiles();
  }

  getStudents() {
    this.studentService
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
        }
      })
      .catch(error => this.error = error);
  }

  getFiles() {
    this.filesService
      .getFiles()
      .then(files => {
        this.files = files;
        for (let file of this.files) {
          file.userID = +file.userID;
        }
        swal.close();
        console.log(this.files);
      })
      .catch(error => error);
  }

  download(file) {
    console.log(file);
    var filename = file.milliseconds + "_" + file.userID + "_" + file.filename;
    this.filesService
      .download(filename)
      .then(response => {
        var blob = new Blob([response], { type: "application/pdf" });
        //change download.pdf to the name of whatever you want your file to be
        console.log(blob);
        saveAs(blob, file.filename);
      })
      .catch(error => error);
  }

  deleteFileAlert(file) {
    var filename = file.milliseconds + "_" + file.userID + "_" + file.filename;
    swal({
      title: 'Delete file (' + file.filename + ')?',
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
        this.deleteFile(filename);
      }
    }).catch(error => error);
  }

  deleteFile(filename) {
    event.stopPropagation();
    this.filesService
      .delete(filename)
      .then(res => {
        this.getFiles();
        swal(
          'Deleted!',
          'File has been deleted.',
          'success'
        );
      })
      .catch(error => error);
  }

  addFile() {
    this.router.navigate(['/file-upload']);
  }

  archiveAlert(student: Student, event: any) {
    swal({
      title: 'Archive student (' + student.firstName + ' ' + student.lastName + ')',
      text: "Are you sure want to do this?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Archive it!'
    }).then(isConfirm => {
      if (isConfirm.dismiss === "cancel" || isConfirm.dismiss === "overlay") {
        console.log(isConfirm.dismiss);
      } else if (isConfirm) {
        this.archiveStudent(student, event);
      }
    }).catch(error => {
      console.log(error);
    });
  }

  archiveStudent(student, event): void {
    swal(
      'Sorry...',
      'This functionality is not yet available',
      'info'
    );
  }

  populatePRF(student) {
    this.studentService
      .populatePRF(student.userID)
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
        } else if ((result as any).result === 'success') {
          swal(
            'Sorry...',
            'This feature is not yet available',
            'info'
          );
        } else {
          swal(
            'Error',
            'Something went wrong, please try again.',
            'error'
          );
        }
      })
      .catch(error => console.log(error));
  }

  viewInfo(student: Student) {
    swal({
      title: 'Loading...'
    });
    swal.showLoading();
    this.resetView();
    this.showGeneral = true;
    this.studentInfoView = true;
    this.studentView = student;
    this.studentsFiles = this.files.filter(x => x.userID === this.studentView.userID);
    this.studentService
      .getAllFormsByID(student)
      .then(forms => {
        if ((forms as any).result === 'error') {
          this.consentView = null;
          this.learningStyleView = null;
          this.suitabilityView = null;
          this.displayErrorAlert(forms);
        } else {
          this.consentForms = forms.consentForm;
          this.learningStyleView = forms.learningStyleForm[0];
          this.suitabilityView = forms.suitabilityForm[0];
          this.barChartData = [{ data: [this.learningStyleView.hearing, this.learningStyleView.seeing, this.learningStyleView.doing] }];
        }
        swal.close();
      })
      .catch(error => this.error = error);
  }

  viewCourses(student: Student) {
    this.resetView();
    this.studentCoursesView = student;
    this.getTimetableById(student.userID);
  }

  getTimetableById(userID) {
    this.studentService
    .getEventsById(userID)
    .then(result => {
      if ((result as any).result === 'error') {
        this.displayErrorAlert(result);
      } else {
        this.studentCourses = result;
      }
    }).catch(error => {
      console.log("Error getting timetable by id");
    });
  }

  overallStatus() {
    this.resetView();
  }

  sectionBtnClicked(event, section) {
    this.resetView();
    this.studentInfoView = true;
    if (section === "general") {
      this.showGeneral = true;
    } else if (section === "suitability") {
      this.showSuitability = true;
    } else if (section === "consent") {
      this.showConsent = true;
    } else if (section === "learningStyle") {
      this.showLearningStyle = true;
    } else if (section === "files") {
      this.showFiles = true;
    }
  }

  editGeneralInfo(student) {
    this.studentEdit = student;
    this.showGeneral = false;
    this.showGeneralInfoEdit = true;
  }

  updateGeneralInfo() {
    swal({
      title: 'Updating...'
    });
    swal.showLoading();
    this.studentService
      .updateGeneralInfo(this.studentEdit)
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
          this.getStudents();
          this.showGeneralInfoEdit = false;
          this.showGeneral = true;
        } else {
          swal(
              'Error',
              'Something went wrong, please try again.',
              'warning'
          );
        }
      })
      .catch();
  }

  allowClientToEdit(student, permission) {
    this.studentService
      .grantConsentEditPermission(student, permission)
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
        } else if ((result as any).result === 'granted') {
          this.studentView.editConsentRequest = false;
          swal(
            'Student Access Granted',
            'Student will be sent an email informing that they can now edit conesnt.',
            'success'
          );
        } else if ((result as any).result === 'denied') {
          this.studentView.editConsentRequest = false;
          swal(
            'Student Access Denied',
            'Student will be sent an email informing that they can NOT edit conesnt.',
            'danger'
          );
        } else {
          swal(
            'Error',
            'Something went wrong, please try again.',
            'error'
          );
        }

      }).catch();
  }

  onSelectChange(event) {
    var consentForm = this.getConsentFormByConsentID(this.selectedConsentForm);
    this.consentView = consentForm[0];
  }

  getConsentFormByConsentID(id) {
    id = +id;
    var consentForm = this.consentForms.filter(x => x.consentID === id);
    return consentForm;
  }

  resetView() {
    this.studentCoursesView = null;
    this.showGeneralInfoEdit = false;
    this.studentInfoView = false;
    this.showGeneral = false;
    this.showSuitability = false;
    this.showConsent = false;
    this.showLearningStyle = false;
    this.showFiles = false;
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
