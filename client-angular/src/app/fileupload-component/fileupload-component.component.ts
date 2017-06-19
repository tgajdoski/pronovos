import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { FileListService } from '../services/file-list.service'


@Component({
  selector: 'app-fileupload-component',
  templateUrl: './fileupload-component.component.html',
  styleUrls: ['./fileupload-component.component.css'],
  providers: [FileListService]
})
export class FileuploadComponentComponent implements OnInit {
 // public uploader:FileUploader = new FileUploader({url:'http://drawback.evolutionit.com/upload', isHTML5: true});
  public uploader:FileUploader = new FileUploader({url:'http://drawback.rubixcubesolutions.com/upload', isHTML5: true});
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

  

 constructor(private _filelistService: FileListService, private ref: ChangeDetectorRef) { 
   this.uploader.onBeforeUploadItem = (item) => {
       this.ref.detectChanges();
    item.withCredentials = false;
      
  }
  
   this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
    //  var responsePath = JSON.parse(response);
    // console.log(response, responsePath);// the url will be in the response
   // console.log("se sredi");
   this.loadFileList();
  
  }

   this.uploader.onProgressAll = (progress:any) => {
    //   this.progress = progress;
     //  this.showProgress = true;
      // this.incrementValue();
       this.uploader.progress = progress;
       console.log(this.uploader.progress);
        this.ref.detectChanges();
//       console.log('before', progress);
    }

    this.paginateFiles();
  };


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
     var serviceot = this._filelistService;
     var filename =  this.fileName;

    var splitfiles = serviceot.splitFile(this.fileName, function(res){
        var thumbnails = serviceot.createThumbs(filename);
    }); 
   
    
     

 
   }


   convertoDocx(e: any, element: any) {
    this._id = element._id;
    this.fileName = element.filename;
    this.originalname = element.originalname;
    this.mimetype = element.mimetype;
    this.size = element.size;
    this.uploadDate = element.uploadDate;
     var serviceot = this._filelistService;
     var filename =  this.fileName;

     if (e.innerText!="Download")
     {
        var convertFile = serviceot.converToDocx(this.fileName, function(res){
          e.innerText = "Download";
        });
      }
      else
      { 
        alert("asdasd");
      }
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
