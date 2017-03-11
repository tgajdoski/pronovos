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

  pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/pdf-test.pdf';
  page:number = 1;
  pageurl:SafeResourceUrl;
  
  public fileList: string;

  private sub: any;      // -> Subscriber
  private foldername: string;  // -> var I want to init with my route parameter


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
         // se vika node api so parametar foldername 
         // da  dade json so url na pdf-kite 
       
         // da se vrti po site pateki od jsonot 
         // moze da se napravi lista na objekti i vo ng for na view-to
         // i da se napravi thumbnails za sekoj od niv

  }
    

    loadPdfFileList(foldername: any) {
      this._filelistService.getPdfFileList(foldername)
      .subscribe((res: any) => {
        this.fileList = res;     
       console.log(this.fileList);
      });
  }

}
