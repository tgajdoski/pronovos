import {Injectable} from '@angular/core';
import {
    Http,
    HttpModule,
    URLSearchParams,
    Headers,
    Response,
    RequestOptions
} from '@angular/http';
import 'rxjs/add/operator/map'

@Injectable()
export class FileListService {

    private localUrl : string;

    constructor(private _http : Http) {
        this.localUrl = "http://localhost:3001";
    };


    splitFile() {
        // console.log("vikam split :  " + fileName);
     //   console.log("treva da okine: " + this.localUrl + '/split/' + fileName);
        //  return this._http.get(this.localUrl + '/split/' + fileName)
        return this
            ._http
            .get(this.localUrl + '/split/file-1489151331806.pdf')
            .map(res => res.json());
    };


    getFileList() {


        return this
            ._http
            .get(this.localUrl + '/files/')
            .map(res => res.json());

        // vaka rabotit     return this._http.get(this.localUrl +
        // '/split/file-1489151331806.pdf')    .map(res => res.json());

    };

    deleteFile(fileid : any) {
        console.log("adsdasdasd :  " + fileid);
        return this
            ._http
            .delete(this.localUrl + '/files/' + fileid)
            .map(res => res.json());
    };

    

}