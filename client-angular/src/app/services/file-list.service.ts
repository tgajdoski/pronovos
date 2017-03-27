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



  

    splitFile(fileName: any, callback) {
           this._http.get(this.localUrl + '/split/' + fileName)
             .map((res: Response) => res.json())
            .subscribe(res => {
                console.log(res);
                callback(res);
            });    
    };

    createThumbs(fileName: any) {
          return this._http.get(this.localUrl + '/createthumb/' + fileName)
             .map((res: Response) => res.json())
            .subscribe(res => {
                console.log(res);
            });

    };

    getFileList() {
        return this
            ._http
            .get(this.localUrl + '/files/')
            .map(res => res.json());
    };



    getImageS3(folderName: any) {
      return this
            ._http
            .get(this.localUrl + '/test/' + folderName);
    };


    getDataFileList(folderName: any) {
        return this
            ._http
            .get(this.localUrl + '/folderlistdata/' + folderName) 
            .map(res => res.json());
    };

    
    getPdfFileList(folderName: any) {
        return this
            ._http
            .get(this.localUrl + '/folderlist/' + folderName) 
            .map(res => res.json());
    };


    
    gets3PdfFileList(folderName: any) {
        return this
            ._http
            .get(this.localUrl + '/s3folderlist/' + folderName) 
            .map(res => res.json());
    };




    deleteFile(fileid : any) {
        console.log("adsdasdasd :  " + fileid);
        return this
            ._http
            .delete(this.localUrl + '/files/' + fileid)
            .map(res => res.json());
    };

    

}