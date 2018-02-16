import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../../services/authentication.service';
import { FileUploader } from 'ng2-file-upload';

const URL = 'api/uploadFile';

@Component({
    selector: 'fileUpload',
    templateUrl: './app/components/file-upload/file-upload.component.html',
    styleUrls: ['./app/components/file-upload/file-upload.component.css']
})

export class FileUploadComponent {
  public uploader:FileUploader;

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.uploader = new FileUploader({url: URL});
    this.uploader.onCompleteItem = (item:any, response:any, status:any, headers:any) => {
        console.log("ImageUpload:uploaded:", item, status);
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
