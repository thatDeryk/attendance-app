import { Component, OnInit } from '@angular/core';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
  DAYS_OF_WEEK
} from 'angular-calendar';
import {
  getWeek,
  addBusinessDays,
  getHours,
  setHours,
  getDay,
  getDate,
  isPast,
  getTime,
  parseISO
} from 'date-fns';
import { LecturesService } from 'src/app/provider/lectures/lectures.service';
import { ActionSheetController, NavController } from '@ionic/angular';
import { AttendanceService } from 'src/app/provider/attendance/attendance.service';
import { Observable, of } from 'rxjs';
import { Storage } from '@ionic/storage';
import * as lod from 'lodash';
import { te } from 'date-fns/locale';
import { NotifyService } from 'src/app/provider/notify/notify.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  viewDate: Date = addBusinessDays(new Date(), 0);
  currentView = 'list';
  mySchedule: Observable<any>;
  // just for the purposes of the demo so it all fits in one screen 2020-03-28T08:00:00.429Z
  dayStartHour = 9; // Math.max(9, getHours(new Date()) - 9); //  setHours(new Date(), 9).getHours();

  dayEndHour = 17; // Math.min(17, getHours(new Date()) + 17);
  // exclude weekends
  excludeDays: number[] = [0, 6];

  weekStartsOn = DAYS_OF_WEEK.SUNDAY;
  constructor(
    private lectureService: LecturesService,
    private notify: NotifyService,
    private navCtrl: NavController,
    private storage: Storage,
    private actionSheetCtrl: ActionSheetController,
    private attendanceService: AttendanceService
  ) {
    console.log(getHours(new Date()));
  }

  async ngOnInit() {
    const employe = await this.storage.get('employee');
    const mySchedules = this.lectureService.getSchedule(employe.idNumber);

    mySchedules.subscribe(timeTable => {
      if (!timeTable) {
        return [];
      }
      const mySchedule = [];
      timeTable.forEach(schedule => {
        const slots: Array<any> = schedule.slots;

        mySchedule.push({
          day: schedule.day
          // slots: []
        });
        slots.forEach(val => {
          const slot = [];
          if (val.taughtBy === employe.idNumber) {
            slot.push(val);
            // mySchedule.push({
            //   day: schedule.day,
            //   slots: slot
            // });
            // tslint:disable-next-line: prefer-for-of
            for (let t = 0; t < mySchedule.length; t++) {
              // console.log(mySchedule.length);
              if (mySchedule[t].day === schedule.day) {
                if (!mySchedule[t].slots) {
                  mySchedule[t].slots = slot;
                } else {
                  mySchedule[t].slots.push(slot[0]);
                }
              }
            }
          }
        });
      });
      const order = {
        Monday: 2,
        Tuesday: 3,
        Wednesday: 4,
        Thursday: 5,
        Friday: 6
      };
      mySchedule.sort((a, b) => {
        return order[a.day] - order[b.day];
      });
      mySchedule.map(v => {
        if (v.slots) {
          v.slots.sort((x, y) => {
            const startx = x.start.split(':')[0];
            const starty = y.start.split(':')[0];

            return startx - starty;
          });
        }
      });
      this.mySchedule = of(mySchedule);
    });
    // console.log(this.dayEndHour);
  }

  changeView() {
    this.currentView = this.currentView === 'calendar' ? 'list' : 'calendar';
    // console.log(this.currentView);
  }

  async initAttendance(schedule, slot: any) {
    try {
      const days = DAYS_OF_WEEK; // {
      //   Monday: 1,
      //   Tuesday: 2,
      //   Wednesday: 3,
      //   Thursday: 4,
      //   Friday: 5
      // };
      // get current day and check day for selected schedule against current day;
      let currentDay: string;
      const slotStart = +slot.start.split(':')[0];
      const slotEnd = +slot.end.split(':')[0];
      const currentTime = getHours(new Date());

      for (const key in days) {
        if (days.hasOwnProperty(key)) {
          // const element = days[key];
          if (+days[key] === getDay(new Date())) {
            // console.log(currentDay);
            // console.log(key);
            currentDay = key;
          }
        }
      }
      // if current day is not same as day of selected schedule
      // do not proceed...
      if (currentDay.toLowerCase() !== schedule.day.toLowerCase()) {
        // cant generate attendance// not allowed
        throw new Error('cant generate attendance, not allowed');
        // return;
      }
      // check current time against start and end time of selected schedule
      // if schedule end time is greater than current time.. schedule has passed
      // so do not proceed...
      if (currentTime > slotEnd) {
        // lecture not allowed time frame is in the past...
        throw new Error('not allowed time frame error...');
        // return;
      }

      // if current  time is not greater or equal to start time..
      // get the number hrs until start time...
      if (currentTime < slotStart) {
        const hoursBetween = slotStart - currentTime;
        console.log(hoursBetween);
        // if start time is not same or an hour before schedule start time.
        // do not proceed...
        if (hoursBetween > 1) {
          // allow only if hrs to start time is less than 1 HR
          throw new Error('allow only if hrs to start time is less than 1 HR');
          // return;
        }
      }

      // if current day same as selected schedule day and current time is an hour before selected schedule time
      // proceed....
      // ***************************************** */
      const isOngoingAttendance = await this.storage.get('ongoinAttendance');
      let barcode = '';
      console.log(isOngoingAttendance);

      // check if there is an exiting attendance for selected schedule...
      if (isOngoingAttendance) {
        const attendanceId = isOngoingAttendance.attendanceId;
        const lectureId = isOngoingAttendance.lectureId;
        const isAttendance: any = await this.attendanceService.checkAttendance(
          attendanceId,
          lectureId
        );

        if (isAttendance) {
          barcode = isAttendance.barcode;
          const tslotEnd = +isAttendance.slot.time.end.split(':')[0];
          console.log(tslotEnd);
          // check if lecture time frame is still valid...
          // max slot end is 17 and min slot end is 9
          // so assumming
          if (tslotEnd > currentTime) {
            // not yet end of lecture
            // get hrs till lecture end...
            const hoursBetween = tslotEnd - currentTime;
            // console.log(tslotEnd - currentTime);
            console.log(hoursBetween);
            this.notify.presentToast(
              `Apprx. ${hoursBetween} Hrs to lecture end`,
              'warning',
              'top',
              10000
            );
          } else {
            const hoursBetween = currentTime - tslotEnd;
            if (hoursBetween >= 1) {
              this.notify.presentToast(
                `Closing lecture code;`,
                'warning',
                'top',
                10000
              );
              // await this.attendanceService.closeAttendance(attendanceId);
              this.storage.remove('ongoinAttendance');
              return;
            }
          }
          // console.log(getHours(getTime(parseISO(slotEnd))));
          this.gotoCodePage(barcode);
        } else {
          throw new Error('An error occured');
        }
        // if there is an exiting attendance get the id for the attendance and proceed to qr page;
        // console.log(isAttendance);
        // barcode = isAttendance.barcode;
        return;
      }

      // if no existing attendance
      // proceed with new attendance creation...
      // console.log(slot);
      // console.log(barcode);

      const createAttendanceId = await this.attendanceService.createAttendance(
        schedule,
        slot,
        barcode
      );
      await this.storage.set('ongoinAttendance', {
        lectureId: slot.id,
        attendanceId: createAttendanceId
      });

      barcode = `${new Date(Date.now()).toUTCString()}?${slot.id}?${
        schedule.day
      }?${createAttendanceId}`;
      // slot.id equalises to lecture Id
      this.gotoCodePage(barcode);
    } catch (error) {
      console.log(error);
      this.notify.presentToast(error, 'danger', 'top', 9000);
    }
  }
  private gotoCodePage(barcode: string) {
    this.navCtrl.navigateForward([`employee/qr-code/${barcode}`]).catch();
  }

  async initAction(schedule: any, slot: any) {
    const action = await this.actionSheetCtrl.create({
      header: 'Choose action',
      buttons: [
        {
          text: 'Start/Continue Attendance code',
          handler: () => {
            this.initAttendance(schedule, slot);
          }
        }
      ]
    });

    await action.present();
  }
}
