import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { FilesService } from "../../services/files.service";

declare var swal: any;
declare var FileSaver: any;

@Component({
    selector: 'files',
    templateUrl: './app/components/files/files.component.html',
    styleUrls: ['./app/components/files/files.component.css']
})

export class FilesComponent {
  private files: any[];
  constructor(private http: Http, private router: Router, private route: ActivatedRoute, private authService: AuthService, private filesService: FilesService) {

  }

  ngOnInit() {
    this.getFiles();
  }

  getFiles() {
    this.filesService
        .getFiles()
        .then(files => {
          this.files = files;
        })
        .catch(error => error);
  }

  download(file) {
    var filename = file.milliseconds + "_" + file.filename;
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

  deleteAlert(file) {
      var filename = file.milliseconds + "_" + file.filename;
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

  goBack() {
      window.history.back();
  }
}
