import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IonSearchbar,
  ModalController,
  ActionSheetController,
  ToastController
} from '@ionic/angular';
import { Observable, of, merge } from 'rxjs';
import { FormControl } from '@angular/forms';
import { LecturesService } from 'src/app/provider/lectures/lectures.service';
import { AttendeeService } from 'src/app/provider/attendee/attendee.service';
import { debounceTime, take, mergeAll, mergeMap } from 'rxjs/operators';
import { UserDataService } from 'src/app/provider/user-data/user-data.service';

@Component({
  selector: 'app-attendees',
  templateUrl: './attendees.page.html',
  styleUrls: ['./attendees.page.scss']
})
export class AttendeesPage implements OnInit {
  @ViewChild(IonSearchbar, { static: true }) searchBar: IonSearchbar;
  public attendees$: Observable<any>;
  selectedAttendee: any;
  public searchString = '';
  searching: boolean;
  searchControl: FormControl;
  items: any;
  assignedLectures: Observable<any[]>;
  attendeeSelected: boolean;
  selectedLecture: any;
  temp = [];
  constructor(
    private toastCtrl: ToastController,
    private lectureService: LecturesService,
    private attendeeService: AttendeeService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private userService: UserDataService
  ) {
    this.searchControl = new FormControl();
  }

  async ngOnInit() {
    const emp = await this.userService.getUser('employee');
    this.attendeeService.getAttendees();
    const assignedLectures = [];
    const myPromise = val => new Promise( resolve => {
      for( const lt of val){
        console.log(val);
        this.getLectureName(lt.id, lt.lectureId).then( name => {
          lt.name = name;
          assignedLectures.push(lt);
          resolve(name);
        });
      }
    });


    this.lectureService.getAssignedLectures(
      emp.idNumber
    ).pipe(mergeMap(val => myPromise(val))).subscribe( data => {
     const lecture = [];

     console.log(data);
     console.log(assignedLectures);
     this.assignedLectures = of(assignedLectures);
    });



    this.setFilteredItems('');

    this.searchControl.valueChanges
      .pipe(debounceTime(700))
      .subscribe(search => {
        this.setFilteredItems(search);
      });
  }
  setFilteredItems(searchString: string) {
    this.attendees$ = this.attendeeService.findAttendee(searchString);
    this.attendees$.subscribe(l => console.log(l));
  }
  onSearchInput() {
    this.searching = true;
  }

  selectAttendee(attendee: any) {
    this.attendeeSelected = true;
    this.selectedAttendee = attendee;
  }
  cancelSelected() {
    this.attendeeSelected = false;
    this.selectedAttendee = null;
  }

  addSelected() {
    // console.log(this.selectedLecture);
    // console.log(this.selectedAttendee);
    if (!this.selectedLecture) {
      return;
    }
    if (!this.selectedAttendee) {
      return;
    }

    const attendess: Array<any> = this.selectedLecture.attendees;
    if (attendess.includes(this.selectedAttendee.idNumber)) {
      // alert('Y');t
      this.toast('Attendee already added', 'danger');
      return;
    }

    this.lectureService.addAttendee(
      this.selectedAttendee,
      this.selectedLecture
    );
  }

  async toast(message: string, color: string, dur?: number) {
    const trt = await this.toastCtrl.create({
      message,
      color,
      duration: dur || 5000,
      position: 'top'
    });

    await trt.present();
  }

  async getLectureName(id: string, lectureId){

  return new Promise((resolve, reject) => {
    this.lectureService.getLectureName(lectureId)
    .pipe(take(1)).subscribe(data => {
      const  name = data[0].name;


      resolve(name);
    });
  });



   return '';
  }
}
