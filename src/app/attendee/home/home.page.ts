import { Component, OnInit } from '@angular/core';
import { DAYS_OF_WEEK } from 'angular-calendar';
import { addBusinessDays, getHours } from 'date-fns';
import { LecturesService } from 'src/app/provider/lectures/lectures.service';
import { NavController, ActionSheetController } from '@ionic/angular';
import { AttendanceService } from 'src/app/provider/attendance/attendance.service';
import * as lod from 'lodash';
import { Storage } from '@ionic/storage-angular';
import { AttendeeService } from 'src/app/provider/attendee/attendee.service';
import { Observable, of, scheduled } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { isArray} from 'lodash';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  viewDate: Date = addBusinessDays(new Date(), 0);
  currentView = 'list';
  mySchedule: Observable<any>;
  attendeeTimetable: Observable<any>;
  // just for the purposes of the demo so it all fits in one screen 2020-03-28T08:00:00.429Z
  dayStartHour = 9; // Math.max(9, getHours(new Date()) - 9); //  setHours(new Date(), 9).getHours();

  dayEndHour = 17; // Math.min(17, getHours(new Date()) + 17);
  // exclude weekends
  excludeDays: number[] = [0, 6];

  weekStartsOn = DAYS_OF_WEEK.SUNDAY;
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

  async ngOnInit() {
    const lectures = this.lectureService.getLectures();

    const myPromise1 = (val) =>
      new Promise((resolve) =>
        lectures.subscribe((data) => {
          for (const key in val) {
            if (val.hasOwnProperty(key)) {
              const element = val[key];
              if (element.slots) {
                element.slots.map((el) => {
                  const id = el.id;
                  const d = data.find((v) => v.id === id);

                  el.name = d.name;
                });
              }
            }
          }
          resolve(val);
        })
      );
    const attendee = await this.storage.get('attendee');

    if (!attendee) {
      return;
    }
    const mySchedule = [];

    const myPromise = (val, idNumber) =>
      new Promise((resolve) => {
        const lecturesToServ =  val.filter( c => c.attendees.includes(idNumber));

        for (const iterator of lecturesToServ) {

          this.attendeeService
            .getAttendeeTimetable(iterator.lectureId)
            .subscribe((lec) => {

              mySchedule.push(lec);
              resolve(lec);
            });
        }
      });


    let myLectures = [];
    this.attendeeService
      .getAttendeeLectures(attendee.idNumber)
      .pipe(mergeMap((val) => {
        myLectures =  val.map(l => l.lectureId);
        return myPromise(val, attendee.idNumber)}))
      .subscribe((timeTable: any) => {
        console.log(timeTable);
        console.log('---------------------');
        console.log(myLectures);
        console.log('---------------------');

        if (timeTable) {
          let mySchedulee = [];
          const order = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Monday: 2,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Tuesday: 3,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Wednesday: 4,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Thursday: 5,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Friday: 6,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Saturday: 7,
          };


          // eslint-disable-next-line guard-for-in
          for(const days in order){

            mySchedulee.push(
             {
               day: days,
               slots: []
             }
           );
          }
       mySchedulee =   mySchedulee.map(scheduledd => {

          timeTable.forEach(element => {
            if(element.day.toLowerCase().trim() === scheduledd.day.toLowerCase().trim()){
              scheduledd.slots = element.slots;
            }
          });
         return scheduledd;
       });
         mySchedulee.sort((a, b) => order[a.day] - order[b.day]);
          mySchedulee = mySchedulee.map((v) => {
            if (v.slots) {
              v.slots.sort((x, y) => {
                const startx = x.start.split(':')[0];
                const starty = y.start.split(':')[0];

                return startx - starty;
              });
            }
            return v;

          });
          const schd = of(mySchedulee);
          schd.pipe(map((val) => myPromise1(val)))
          .subscribe(async (d) => {
            const compromisedLecture: any = await d;
            const onlyMinLectures = [];
            if(isArray(compromisedLecture) && compromisedLecture.length > 0) {
              compromisedLecture.forEach((v) => {
                const ss =  v.slots.filter( s => myLectures.includes(s.id));
                if(ss && ss.length > 0){
                  onlyMinLectures.push({
                    ...v,
                    slots : ss
                  });
                }
              });
              this.mySchedule = of(onlyMinLectures);
            }else{
              this.mySchedule = of([]);
            }

          });
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
