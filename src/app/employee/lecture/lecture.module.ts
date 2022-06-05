import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LecturePageRoutingModule } from './lecture-routing.module';

import { LecturePage } from './lecture.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { AddLectureModalComponent } from 'src/app/components/add-lecture-modal/add-lecture-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LecturePageRoutingModule,
    ComponentsModule
  ],
  declarations: [LecturePage],
  entryComponents: [AddLectureModalComponent]
})
export class LecturePageModule {}
