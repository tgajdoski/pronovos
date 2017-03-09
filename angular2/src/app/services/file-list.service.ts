import { Injectable } from '@angular/core';
import { Http, HttpModule, URLSearchParams, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map'

@Injectable()
export class FileListService {


    private localUrl: string;

    constructor(private _http: Http) {
        this.localUrl = "http://localhost:3001";
      //  console.log("Files Provider");
    }

    getFileList() {
        return this._http.get(this.localUrl + '/files/')
            .map(res => res.json());
    }
}