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
    students: Student [];
    error: any;
    studentInfoView: boolean = false;
    studentView: Student;
    studentCoursesView : Student;
    studentCourses : any[];
    consentView: ConsentForm;
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
    barChartOptions:any = {
      scaleShowVerticalLines: false,
      responsive: true
    };
    barChartLabels:string[] = ['Hearing', 'Seeing', 'Doing'];
    barChartType:string = 'bar';
    barChartLegend:boolean = false;
    barChartData:any;
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
          if ((students as any).status === "403") {
            this.students = null;
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
            var blob = new Blob([response], {type: "application/pdf"});
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
            .then(response => {
              swal(
                  'Sorry...',
                  'This feature is not yet available',
                  'info'
              );
            })
            .catch(error => console.log(error));
    }

    viewInfo(student: Student) {
      this.resetView();
      this.showGeneral = true;
      this.studentInfoView = true;
      this.studentView = student;
      this.studentsFiles = this.files.filter(x => x.userID === this.studentView.userID);
      this.studentService
        .getAllFormsByID(student)
        .then(forms => {
          if (forms.status === "403") {
            this.consentView = null;
            this.learningStyleView = null;
            this.suitabilityView = null;
          } else {
            this.consentView = forms.consentForm[0];
            this.learningStyleView = forms.learningStyleForm[0];
            this.suitabilityView = forms.suitabilityForm[0];
            this.barChartData = [{ data: [this.learningStyleView.hearing, this.learningStyleView.seeing, this.learningStyleView.doing]}];
          }
        })
        .catch(error => this.error = error);
    }

    viewCourses(student: Student) {
      this.resetView();
      this.studentCoursesView = student;
      this.getTimetableById(student.userID);
    }

    getTimetableById(userID) {
      this.studentService.getEventsById(userID).then(result => {
        this.studentCourses = result;
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
        .then( res => {
          this.getStudents();
          this.showGeneralInfoEdit = false;
          this.showGeneral = true;
          swal.close();
        })
        .catch();
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

    goBack() {
        window.history.back();
    }
}
