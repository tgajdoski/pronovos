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
  
  public filepdfList: string[];
  public filepngList: string[];
  public filedataList: string[];
  public pdfShow :boolean;
  public filebookmarkname :string;
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
     
        this.loadDataDocFileList(this.foldername);
          this.loadPdfFileList(this.foldername);
  }
    
     setParams(item :any, datafileindex: any){
       console.log(item);
       console.log(datafileindex);
       this.pdfShow = true;
       var str = item;
        var rest = str.replace(".png", ".pdf"); 
        this.filebookmarkname = this.filedataList[datafileindex];
        console.log(rest);
        this.pdfSrc=rest;
        this.pageurl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
    }

    loadPdfFileList(foldername: any) {
      this._filelistService.getPdfFileList(foldername)
      .subscribe((res: any) => {
        this.filepdfList =[];
         this.filepngList =[];
        var tempList = res;
        tempList.forEach(element => {
          //  console.log(element);
          //  console.log(element['pdfPath']);
          //  console.log(element['pdfName']);
            if(element['pdfPath'].endsWith('.pdf'))
              this.filepdfList.push(element['pdfPath']);
            if(element['pdfPath'].endsWith('.png'))
              this.filepngList.push(element['pdfPath']);  
        });
 //console.log( this.filepngList);
 //console.log( this.filepdfList);
      });
      
  }

   loadDataDocFileList(foldername: any) {
            this._filelistService.getDataFileList(foldername)
            .subscribe((res: any) => {
              this.filedataList = res;              
              console.log(this.filedataList);
            });
   }
}