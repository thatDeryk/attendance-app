import { Component, OnInit, ViewChild } from '@angular/core';
import { LecturesService } from 'src/app/provider/lectures/lectures.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import {
  IonSearchbar,
  ActionSheetController,
  ModalController
} from '@ionic/angular';
import { Observable } from 'rxjs';
import { AddLectureModalComponent } from 'src/app/components/add-lecture-modal/add-lecture-modal.component';
@Component({
  selector: 'app-lecture',
  templateUrl: './lecture.page.html',
  styleUrls: ['./lecture.page.scss']
})
export class LecturePage implements OnInit {
  @ViewChild(IonSearchbar, { static: true }) searchBar: IonSearchbar;
  public lectures$: Observable<any>;
  public searchString = '';
  searching: boolean;
  searchControl: FormControl;
  items: any;
  constructor(
    private lectureService: LecturesService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController
  ) {
    this.searchControl = new FormControl();
  }

  ngOnInit() {
    this.lectureService.getLectures();

    this.setFilteredItems('');

    this.searchControl.valueChanges
      .pipe(debounceTime(700))
      .subscribe(search => {
        this.setFilteredItems(search);
      });
  }

  setFilteredItems(searchString: string) {
    this.lectures$ = this.lectureService.findLectures(searchString);
    this.lectures$.subscribe(l => console.log(l));
  }
  onSearchInput() {
    this.searching = true;
  }

  async addToSchedule(lecture) {
    const sheet = await this.actionSheetCtrl.create({
      header: `Add ${lecture.name} to schedule?`,
      buttons: [
        {
          text: 'Add',
          icon: 'add',
          cssClass: 'add-btn',
          handler: () => {
            this.addLecture(lecture);
          }
        },
        {
          role: 'cancel',
          text: 'Cancel',
          cssClass: 'cancel-btn',

          icon: 'close',

          handler: () => {}
        }
      ]
    });

    await sheet.present();
  }
  async addLecture(lecture: any) {
    // throw new Error('Method not implemented.');
    const modal = await this.modalCtrl.create({
      component: AddLectureModalComponent,
      componentProps: { lectureData: lecture }
    });

    await modal.present();
  }
}
