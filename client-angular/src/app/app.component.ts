import { Component } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { FileListService } from './services/file-list.service'

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
   providers: [FileListService]
})

export class AppComponent {
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

 constructor(private _filelistService: FileListService) { }
  paginateEmployee() {
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
      this.paginateEmployee();
  }


 workOcr(e: any, element: any) {
    this._id = element._id;
    this.fileName = element.filename;
    this.originalname = element.originalname;
    this.mimetype = element.mimetype;
    this.size = element.size;
    this.uploadDate = element.uploadDate;
  //  console.log(element);
  //  console.log("imeto na pdf-ot: " + this.originalname);
    this._filelistService.splitFile();
  //  this._filelistService.splitFile(this.fileName);

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




