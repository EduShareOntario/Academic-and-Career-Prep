import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { StudentService } from '../../services/student.service';
import { ClientService } from '../../services/client.service';
import { FileUploader } from 'ng2-file-upload';
import { Student } from "../../models/Student";
import { Client } from "../../models/Client";

const URL = 'api/uploadFile';

@Component({
    selector: 'fileUpload',
    templateUrl: './app/components/file-upload/file-upload.component.html',
    styleUrls: ['./app/components/file-upload/file-upload.component.css']
})

export class FileUploadComponent implements OnInit {
  public uploader:FileUploader;
  students: Student[];
  clients: Client[];
  selectedStudent: number;
  users: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService, private studentService: StudentService, private clientService: ClientService) {
    this.uploader = new FileUploader({url: URL});
    this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
        // console.log("ImageUpload:uploaded:", item, status);
    };
  }

  ngOnInit() {
    this.studentService
        .getStudents()
        .then(students => {
            this.students = students;
            for (let student of this.students) {
              var info = { label: student.firstName + ' ' + student.lastName, value: student.userID };
              this.users.push(info);
            }
        })
        .catch(error => {
          // do something
        });
      this.clientService
          .getClients()
          .then(clients => {
              this.clients = (clients as any).clients;
              for (let client of this.clients) {
                var info = { label: client.firstName + ' ' + client.lastName, value: client.userID };
                this.users.push(info);
              }
          })
          .catch(error => {
            // do something
          });
  }

  userSelect() {
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
