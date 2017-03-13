import { Component, OnInit } from '@angular/core';
import {BrowserModule, DomSanitizer,SafeResourceUrl} from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FileListService } from '../services/file-list.service'

@Component({
  selector: 'app-thumb-component',
  templateUrl: './thumb-component.component.html',
  styleUrls: ['./thumb-component.component.css'],
   providers: [FileListService]
})
export class ThumbComponentComponent implements OnInit {

// vrti po sekoj pdf of dir i pravi 

  pdfSrc = 'http://localhost:3001/uploads/split/file-1489246452855/page00001.pdf';
  page:number = 1;
  pageurl:SafeResourceUrl;
  
  public fileList: string[];
  public pdfShow :boolean;
  private sub: any;      
  private foldername: string;  

  constructor(private domSanitizer:DomSanitizer, public route: ActivatedRoute, private _filelistService: FileListService ){

  }

  ngOnInit() {
  
    this.pageurl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);

    this.sub = this.route
            .params
            .subscribe(params => {
                this.foldername = params['foldername'].replace(/\.[^/.]+$/, ""); 
        });

        this.loadPdfFileList(this.foldername);
  }
    
     setParams(item :any){
       console.log(item);
       this.pdfShow = true;
      this.pdfSrc=item;
      this.pageurl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
    }

    loadPdfFileList(foldername: any) {
      this._filelistService.getPdfFileList(foldername)
      .subscribe((res: any) => {
        this.fileList =[];
        var tempList = res;
        tempList.forEach(element => {
        //   console.log(element['pdfPath']);
       //    console.log(element['pdfName']);
            if(element['pdfPath'].endsWith('.pdf'))
              this.fileList.push(element['pdfPath']);
            
        });
    
    //   var firstpdf =   jsonObj[1]['pdfPath'];
     //  console.log(this.fileList);
     //  console.log(firstpdf.dir);
      });
  }

}
