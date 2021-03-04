import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MFlipbookComponent } from './m-flipbook.component';
import { MPageComponent } from './m-page/m-page.component';
import { PortalModule } from '@angular/cdk/portal';
import { MPageBodyComponent, MPageBodyPortal } from './m-page-body/m-page-body.component';
import { MPageContent } from './m-page/m-page-content';



@NgModule({
  declarations: [
    MFlipbookComponent,
    MPageComponent,
    MPageBodyComponent,
    MPageBodyPortal,
    MPageContent
  ],
  imports: [
    CommonModule,
    PortalModule
  ],
  exports: [
    MFlipbookComponent,
    MPageComponent,
    MPageContent,
  ]
})
export class MFlipbookModule { }
