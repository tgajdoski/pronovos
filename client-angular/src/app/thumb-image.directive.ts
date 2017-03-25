import { Directive ,OnInit, Input} from '@angular/core';
import {Http} from '@angular/http';
import { DomSanitizer} from '@angular/platform-browser';


@Directive({
  selector: '[appThumbImage]',
  // providers: [BROWSER_SANITIZATION_PROVIDERS],
    host: {
    '[src]': 'sanitizer.bypassSecurityTrustUrl(imageData)'
  }
})
export class ThumbImageDirective  implements OnInit{
  imageData: any;
  @Input('thumb-image') pngname: string;

  constructor(private http: Http,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {        
    this.http.get("http://localhost:3001/test/") // + this.pngname)
      .map(image => image.json())
      .subscribe(
        data => {
          this.imageData = 'data:image/png;base64,' + data;
        }
      );
  }

}
