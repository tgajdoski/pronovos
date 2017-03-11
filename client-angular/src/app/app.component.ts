import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-root',
  template: `<nav class="navbar navbar-default">
    <div class="container-fluid">
        <div class="navbar-header">
           <h1 class="title">Drawing management system</h1>
            <ul class="nav navbar-nav">
                    <li><a routerLink="/uploadfile" routerLinkActive="active">Upload files</a></li>
                    <li> <a routerLink="/thumb" routerLinkActive="active">Thumbnails</a></li>
                    <li><a routerLink="/admin" routerLinkActive="active">Admin</a></li>
                    <li><a routerLink="/login" routerLinkActive="active">Login</a></li>
                </ul>
        </div>
    </div>
   
   
    <router-outlet></router-outlet>
   <!-- <router-outlet name="popup"></router-outlet> -->
  `
})

export class AppComponent {
}




