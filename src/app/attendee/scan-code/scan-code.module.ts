import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScanCodePageRoutingModule } from './scan-code-routing.module';

import { ScanCodePage } from './scan-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScanCodePageRoutingModule
  ],
  declarations: [ScanCodePage]
})
export class ScanCodePageModule {}
