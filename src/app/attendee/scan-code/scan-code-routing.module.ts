import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ScanCodePage } from './scan-code.page';

const routes: Routes = [
  {
    path: '',
    component: ScanCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScanCodePageRoutingModule {}
