import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { StudentService } from '../../services/student.service';
import { FileUploader } from 'ng2-file-upload';
import { Student } from "../../models/Student";

const URL = 'api/uploadFile';

@Component({
    selector: 'fileUpload',
    templateUrl: './app/components/file-upload/file-upload.component.html',
    styleUrls: ['./app/components/file-upload/file-upload.component.css']
})

export class FileUploadComponent {
  public uploader:FileUploader;
  students: Student[];
  selectedStudent: number;


  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService, private studentService: StudentService) {
    this.uploader = new FileUploader({url: URL});
    this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
        console.log("ImageUpload:uploaded:", item, status);
    };
    this.studentService
        .getStudents()
        .then(students => {
            this.students = students;
            console.log(this.students);
        })
        .catch(error => {
          // do something
        });
  }

  studentSelect() {
    console.log(this.selectedStudent);
    // this.uploader.setOptions({
    //   additionalParameter: { studentID: this.selectedStudent }
    // });
    this.uploader.onBeforeUploadItem = (item) => {
      item.file.name = this.selectedStudent + '_' + item.file.name;
    };
  }

  public hasBaseDropZoneOver:boolean = false;

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  goBack() {
      window.history.back();
  }
}
