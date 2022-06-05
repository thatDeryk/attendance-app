import { Component, OnInit } from '@angular/core';
import { DAYS_OF_WEEK } from 'angular-calendar';
import { addBusinessDays, getHours } from 'date-fns';
import { LecturesService } from 'src/app/provider/lectures/lectures.service';
import { NavController, ActionSheetController } from '@ionic/angular';
import { AttendanceService } from 'src/app/provider/attendance/attendance.service';
import * as lod from 'lodash';
import { Storage } from '@ionic/storage';
import { AttendeeService } from 'src/app/provider/attendee/attendee.service';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  viewDate: Date = addBusinessDays(new Date(), 0);
  currentView = 'list';
  mySchedule: Observable<any>;
  attendeeTimetable: Observable<any>;
  constructor(
    private lectureService: LecturesService,
    private navCtrl: NavController,
    private actionSheetCtrl: ActionSheetController,
    private attendanceService: AttendanceService,
    private storage: Storage,
    private attendeeService: AttendeeService
  ) {
    console.log(Math.max(9, getHours(new Date()) - 9));
    // this.mySchedule = this.lectureService.getSchedule();
  }
  // just for the purposes of the demo so it all fits in one screen 2020-03-28T08:00:00.429Z
  dayStartHour = 9; // Math.max(9, getHours(new Date()) - 9); //  setHours(new Date(), 9).getHours();

  dayEndHour = 17; // Math.min(17, getHours(new Date()) + 17);
  // exclude weekends
  excludeDays: number[] = [0, 6];

  weekStartsOn = DAYS_OF_WEEK.SUNDAY;
  async ngOnInit() {
    const attendee = await this.storage.get('attendee');

    if (!attendee) {
      return;
    }
    const mySchedule = [];

    const myPromise = val =>
      new Promise(resolve => {
        for (const iterator of val) {
          this.attendeeService
            .getAttendeeTimetable(iterator.lectureId)
            .subscribe(lec => {
              // console.log(lec);

              mySchedule.push(lec);
              resolve(lec);
            });
        }
      });
    this.attendeeService
      .getAttendeeLectures(attendee.idNumber)
      .pipe(mergeMap(val => myPromise(val)))
      .subscribe((timeTable: any) => {
        // console.log(timeTable);
        if (timeTable) {
          const order = {
            Monday: 2,
            Tuesday: 3,
            Wednesday: 4,
            Thursday: 5,
            Friday: 6,
            Saturday: 7
          };
          timeTable.sort((a, b) => {
            return order[a.day] - order[b.day];
          });
          timeTable.map(v => {
            if (v.slots) {
              v.slots.sort((x, y) => {
                const startx = x.start.split(':')[0];
                const starty = y.start.split(':')[0];

                return startx - starty;
              });
            }
          });
          this.mySchedule = of(timeTable);
        }
        // console.log(s);
        // this.mySchedule = of(s);
      });
  }
  changeView() {
    this.currentView = this.currentView === 'calendar' ? 'list' : 'calendar';
    console.log(this.currentView);
  }
}
