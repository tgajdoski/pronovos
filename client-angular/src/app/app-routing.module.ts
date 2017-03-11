import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FileuploadComponentComponent } from './fileupload-component/fileupload-component.component';
import { ThumbComponentComponent } from './thumb-module/thumb-component.component';
import { PageNotFoundComponent } from './not-found.component';

const routes: Routes = [
  {  path: 'uploadfile',  component : FileuploadComponentComponent },
   {  path: 'thumb',  component: ThumbComponentComponent },
   {  path: '', redirectTo: '/uploadfile' , pathMatch : 'full'},
    { path: 'thumb/:foldername', component: ThumbComponentComponent },
   { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
