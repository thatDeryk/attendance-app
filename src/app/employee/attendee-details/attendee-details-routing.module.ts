import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendeeDetailsPage } from './attendee-details.page';

const routes: Routes = [
  {
    path: '',
    component: AttendeeDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendeeDetailsPageRoutingModule {}
