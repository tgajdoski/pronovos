import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';
import { ThumbComponentComponent } from './thumb-module/thumb-component.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './not-found.component';
import { FileuploadComponentComponent } from './fileupload-component/fileupload-component.component';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { ThumbImageDirective } from './thumb-image.directive';


@NgModule({
  declarations: [
    AppComponent, 
    PageNotFoundComponent, 
    FileSelectDirective, 
    FileuploadComponentComponent, 
    ThumbComponentComponent,
    PdfViewerComponent,
    ThumbImageDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
