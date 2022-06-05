import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddLectureModalComponent } from './add-lecture-modal/add-lecture-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [AddLectureModalComponent],
  exports: [AddLectureModalComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    CommonModule
  ]
})
export class ComponentsModule {}
