import { Component, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { FileListService } from '../services/file-list.service'


@Component({
  selector: 'app-fileupload-component',
  templateUrl: './fileupload-component.component.html',
  styleUrls: ['./fileupload-component.component.css'],
  providers: [FileListService]
})
export class FileuploadComponentComponent implements OnInit {
  public uploader:FileUploader = new FileUploader({url:'http://localhost:3001/upload'});
  public fileList: string;
  public _id: any;
  public fileName: any;
  public originalname: any;
  public mimetype: any;
  public size: number;
  public uploadDate: any;

  public page = 1;
  public fileCount: number;
  public pageSize = 1;
  public start = 0;

 constructor(private _filelistService: FileListService) { 
   this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
    //  var responsePath = JSON.parse(response);
    // console.log(response, responsePath);// the url will be in the response
   // console.log("se sredi");
    this.paginateFiles();
  };
 }

    paginateFiles() {
    this.start = ((this.page - 1) * this.pageSize);
    this.loadFileList();
  }

  loadFileList() {
    this._filelistService.getFileList()
      .subscribe((res: any) => {
      //  console.log("Response", res)
        this.fileList = res;
        this.fileCount = res.length;
    //    console.log(this.fileCount);
      });
  }

  ngOnInit() {
//    this.loadFileList();
      this.paginateFiles();
  }


 workOcr(e: any, element: any) {
    this._id = element._id;
    this.fileName = element.filename;
    this.originalname = element.originalname;
    this.mimetype = element.mimetype;
    this.size = element.size;
    this.uploadDate = element.uploadDate;
 
    var splitfiles = this._filelistService.splitFile(this.fileName);
   var thumbnails = this._filelistService.createThumbs(this.fileName);
   console.log("THUMBS" + thumbnails);

  }

  deleteFile(e: any, element: any) {
    this._filelistService.deleteFile(element._id)
      .subscribe(
      res => {
        console.log("File details deleted!");
        this.loadFileList();
      },
      err => {
        console.log("Error deleting file!");
      });
  }



}