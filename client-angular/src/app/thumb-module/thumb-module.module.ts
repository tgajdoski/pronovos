import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThumbComponentComponent } from './thumb-component.component';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import {BrowserModule, DomSanitizer,SafeResourceUrl} from '@angular/platform-browser'
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ThumbImageDirective } from '../thumb-image.directive';

@NgModule({
  declarations: [
    ThumbComponentComponent,
    PdfViewerComponent,
    ThumbImageDirective
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  
  providers: []
})
export class ThumbModuleModule { }
