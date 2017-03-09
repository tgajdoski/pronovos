import { Component } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';

@Component({
    selector: 'my-app',
    templateUrl: './views/app.component.html',
    styleUrls: ['./views/app.component.css']
})
export class AppComponent {
    public uploader:FileUploader = new FileUploader({url:'http://localhost:3001/upload'});
} 