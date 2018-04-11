import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptions  } from '@angular/http';
import { AuthService } from './authentication.service';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class FilesService {

  constructor(private http: Http,
    private authService: AuthService) { }

 base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
       var ascii = binaryString.charCodeAt(i);
       bytes[i] = ascii;
    }
    return bytes;
 }

  getFiles(): Promise<any> {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.get('/api/getFiles', options)
      .toPromise()
      .then(response => response.json())
      .catch(err => err);
  }

  download(filename): Promise<any> {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.post('/api/download/' + filename, {responseType:'blob'}, options)
      .toPromise()
      .then(response => {
        return this.base64ToArrayBuffer(response._body);
      })
      .catch(err => err);
  }

  delete(filename): Promise<any> {
    // add authorization header with jwt token
    let headers = new Headers({ authorization: this.authService.token });
    let options = new RequestOptions({ headers: headers });

    return this.http.delete('/api/deleteFile/' + filename, options)
      .toPromise()
      .then(response => response)
      .catch(err => err);
  }

}
