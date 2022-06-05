import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttendeeDetailsPageRoutingModule } from './attendee-details-routing.module';

import { AttendeeDetailsPage } from './attendee-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendeeDetailsPageRoutingModule
  ],
  declarations: [AttendeeDetailsPage]
})
export class AttendeeDetailsPageModule {}
