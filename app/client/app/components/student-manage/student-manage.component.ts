import { Component, OnInit, NgZone, Input } from '@angular/core';
import { Student } from "../../models/student";
import { Course } from "../../models/course";
import { ConsentForm } from "../../models/consentForm";
import { SuitabilityForm } from "../../models/suitabilityForm";
import { LearningStyleForm } from "../../models/learningStyleForm";
import { AssessmentResults } from "../../models/assessmentResults";
import { Router } from '@angular/router';
import { StaffService } from "../../services/staff.service";
import { StudentService } from "../../services/student.service";
import { ClientService } from "../../services/client.service";
import { CourseService } from "../../services/course.service";
import { AuthService } from "../../services/authentication.service";
import { FilesService } from "../../services/files.service";
declare var saveAs: any;
declare var swal: any;
declare var FileSaver: any;

@Component({
  selector: 'student-manage',
  templateUrl: './app/components/student-manage/student-manage.component.html',
  styleUrls: ['./app/components/student-manage/student-manage.component.css']
})

export class StudentManageComponent implements OnInit {
  students: Student[];
  activity: any;
  error: any;
  studentInfoView: boolean = false;
  studentView: Student;
  studentCoursesView: Student;
  studentCourses: any[];
  waitList: any[];
  consentForms: ConsentForm[];
  consentView: ConsentForm;
  selectedConsentForm: string;
  suitabilityView: SuitabilityForm;
  learningStyleView: LearningStyleForm;
  @Input() assessmentResults: AssessmentResults;
  showGeneral: boolean = true;
  studentEdit: Student;
  showGeneralInfoEdit: boolean = false;
  phone1: boolean = false;
  phone2: boolean = false;
  long1: boolean = false;
  long2: boolean = false;

  showSuitability: boolean;
  showConsent: boolean;
  showLearningStyle: boolean;
  showFiles: boolean;
  showAssessmentResults: boolean;
  editAssessment: boolean;

  //bar chart (learning style)
  barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  barChartLabels: string[] = ['Hearing', 'Seeing', 'Doing'];
  barChartType: string = 'bar';
  barChartLegend: boolean = false;
  barChartData: any;
  barChartColors: any[] = [{ backgroundColor: ["#FF4207", "#F7CE3C", "#62A744"] }];

  files: any[];
  studentsFiles: any[];

  constructor(private router: Router,
    private ngZone: NgZone,
    private staffService: StaffService,
    private studentService: StudentService,
    private clientService: ClientService,
    private courseService: CourseService,
    private authService: AuthService,
    private filesService: FilesService) {

  }

  ngOnInit() {
    swal({
      title: 'Loading...',
      allowOutsideClick: false
    });
    swal.showLoading();
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
        this.getSiteActivity();
      })
      .catch(error => this.error = error);
  }

  getSiteActivity() {
    this.staffService
      .getSiteActivity()
      .then(results => {
        if ((results as any).result === 'error') {
          this.activity = null;
          this.displayErrorAlert(results);
        } else {
          this.activity = results.filter(x => x.type === 'scheduledEmails');
          swal.close();
        }
      })
      .catch(error => this.error = error);
  }

  download(file) {
    var filename = file.milliseconds + "_" + file.userID + "_" + file.filename;
    this.filesService
      .download(filename)
      .then(response => {
        var blob = new Blob([response], { type: "application/pdf" });
        //change download.pdf to the name of whatever you want your file to be
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
      confirmButtonText: 'Yes, Archive!'
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
    this.studentService
      .archiveStudent(student)
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
        } else if ((result as any).result === 'success') {
          swal(
            (result as any).title,
            (result as any).msg,
            (result as any).result
          );
          this.getStudents();
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

  goToStudentArchive() {
    this.router.navigate(['/student-archive']);
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
          var isEmpty = (forms.assessmentResults || []).length === 0;
          if (isEmpty) {
            this.editAssessment = false;
            this.assessmentResults = new AssessmentResults();
          } else {
            this.editAssessment = true;
            this.assessmentResults = forms.assessmentResults[0];
          }
          this.barChartData = [{ data: [this.learningStyleView.hearing, this.learningStyleView.seeing, this.learningStyleView.doing] }];
        }
        swal.close();
      })
      .catch(error => this.error = error);
  }

  viewCourses(student: Student) {
    var userID = student.userID;
    this.resetView();
    this.studentCoursesView = student;
    this.getTimetableById(userID);
    this.getWaitListById(userID);
  }

  getTimetableById(userID) {
    this.studentService
      .getEventsById(userID)
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
          this.studentCourses = null;
        } else if ((result as any).result === 'success') {
          this.studentCourses = null;
          // swal(
          //     result.title,
          //     result.msg,
          //     'info'
          // );
        } else {
          this.studentCourses = result;
        }
      }).catch(error => {
        console.log("Error getting timetable by id");
      });
  }

  getWaitListById(userID) {
    this.waitList = null;

    this.courseService
      .getWaitListById(userID)
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
          this.waitList = null;
        } else {
          this.waitList = result;
        }
      })
      .catch(error => console.log("Error - Get wait list by id: " + error));
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
    var splitPhone = this.studentEdit.phone.split(' ');
    if (this.studentEdit.phone.indexOf('+1') !== -1) {
      this.long1 = true;
      this.studentEdit.phone = splitPhone[1] + " " + splitPhone[2];
      if (splitPhone[3] === 'Home') {
        this.phone1 = false;
      } else {
        this.phone1 = true;
      }
    } else {
      this.long1 = false;
      this.studentEdit.phone = splitPhone[0] + " " + splitPhone[1];
      if (splitPhone[2] === 'Home') {
        this.phone1 = false;
      } else {
        this.phone1 = true;
      }
    }
    var splitAlternate = this.studentEdit.alternateNumber.split(' ');
    if (this.studentEdit.alternateNumber.indexOf('+1') !== -1) {
      this.long2 = true;
      this.studentEdit.alternateNumber = splitAlternate[1] + " " + splitAlternate[2];
      if (splitAlternate[3] === 'Home') {
        this.phone2 = false;
      } else {
        this.phone2 = true;
      }
    } else {
      this.long2 = false;
      this.studentEdit.alternateNumber = splitAlternate[0] + " " + splitAlternate[1];
      if (splitAlternate[2] === 'Home') {
        this.phone2 = false;
      } else {
        this.phone2 = true;
      }
    }
    this.showGeneral = false;
    this.showGeneralInfoEdit = true;
  }

  updateGeneralInfo() {
    swal({
      title: 'Updating...'
    });
    swal.showLoading();
    var phoneSplit = this.studentEdit.phone.split(' ');
    this.studentEdit.phone = phoneSplit[0] + " " + phoneSplit[1];
    if (this.phone1 === true) {
      this.studentEdit.phone = this.studentEdit.phone + " Cell";
    } else if (this.phone1 === false) {
      this.studentEdit.phone = this.studentEdit.phone + " Home";
    }
    if (this.long1 === true) {
      this.studentEdit.phone = "+1 " + this.studentEdit.phone;
    }
    var alternateSplit = this.studentEdit.alternateNumber.split(' ');
    this.studentEdit.alternateNumber = alternateSplit[0] + " " + alternateSplit[1];
    if (this.phone2 === true) {
      this.studentEdit.alternateNumber = this.studentEdit.alternateNumber + " Cell";
    } else if (this.phone2 === false) {
      this.studentEdit.alternateNumber = this.studentEdit.alternateNumber + " Home";
    }
    if (this.long2 === true) {
      this.studentEdit.alternateNumber = "+1 " + this.studentEdit.alternateNumber;
    }
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
          this.studentInfoView = true;
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
    this.showAssessmentResults = false;
    this.showGeneralInfoEdit = false;
    this.studentInfoView = false;
    this.showGeneral = false;
    this.showSuitability = false;
    this.showConsent = false;
    this.showLearningStyle = false;
    this.showFiles = false;
  }

  viewAssessmentResults(student) {
    this.viewInfo(student);
    this.resetView();
    this.studentInfoView = true;
    this.studentView = student;
    this.showAssessmentResults = true;
  }

  addAssessmentResults(userID) {
    this.assessmentResults.userID = userID;
    this.clientService
      .addAssessmentResults(this.assessmentResults)
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
        } else if ((result as any).result === 'success') {
          swal(
            (result as any).title,
            (result as any).msg,
            (result as any).result
          );
          this.resetView();
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

  editAssessmentResults(userID) {
    this.clientService
      .editAssessmentResults(this.assessmentResults)
      .then(result => {
        if ((result as any).result === 'error') {
          this.displayErrorAlert(result);
        } else if ((result as any).result === 'success') {
          swal(
            (result as any).title,
            (result as any).msg,
            (result as any).result
          );
          this.resetView();
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
