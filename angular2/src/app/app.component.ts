import { Component } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { FileListService } from './services/file-list.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
   providers: [FileListService]
})

export class AppComponent {
  public uploader:FileUploader = new FileUploader({url:'http://localhost:3001/upload'});

  public fileList: any;
  public _id: any;
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


}




