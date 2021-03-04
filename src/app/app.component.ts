import { AfterViewChecked, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
// import { FlipConfig } from './flipbook/FlipConfig';
// import { FlipbookComponent } from './flipbook/flipbook.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewChecked {
  title = 'ng-imagebook';

  // settings: FlipConfig = new FlipConfig({
  //   height: 1000,
  //   width: 400
  // });

  @ViewChild('flipbook', { static: false, read: ElementRef }) flipbook: ElementRef;

  constructor(private renderer: Renderer2) { }

  ngOnInit() {

  }

  ngAfterViewChecked(): void {
    // FlipbookComponent.prototype.loadFromHTML(this.renderer.selectRootElement(this.flipbook.nativeElement));
  }
}
