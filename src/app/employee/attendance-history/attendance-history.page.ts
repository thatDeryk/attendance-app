import { Component, OnInit } from '@angular/core';
import { AttendanceService } from 'src/app/provider/attendance/attendance.service';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { LecturesService } from 'src/app/provider/lectures/lectures.service';
import { map, take, mergeMap } from 'rxjs/operators';
import { NotifyService } from 'src/app/provider/notify/notify.service';
import { Observable } from 'rxjs';
import * as lod from 'lodash';

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.page.html',
  styleUrls: ['./attendance-history.page.scss']
})
export class AttendanceHistoryPage implements OnInit {
  defaultHref = '';
  attendanceHistory: Observable<any>;
  showHistory = true;
  attendees: Array<any>;
  title = new Date();
  user: any;
  assignedAttendees = [];
  attendanceSummary = [];
  lectureId: string;
  constructor(
    private attendanceService: AttendanceService,
    private lectureService: LecturesService,
    private route: ActivatedRoute,
    private storage: Storage,
    private notify: NotifyService
  ) {}

  async ngOnInit() {
    await this.notify.presentLoading();
    this.user = await this.storage.get('employee');
    console.log(this.user);
    const lectureId = this.route.snapshot.paramMap.get('lectureId');
    this.lectureId = lectureId;
    console.log(lectureId);

    const myPromise = val =>
      new Promise(resolve => {
        if (val.attendees && val.attendees.length > 0) {
          for (const iterator of val.attendees) {
            console.log(iterator);

            this.attendanceService.getAttendees(iterator).subscribe(a => {
              console.log(a);
              if (a && a.length > 0) {
                a.forEach(at => {
                  this.assignedAttendees.push({
                    name: `${at.firstName} ${at.lastName}`,
                    idNumber: at.idNumber
                  });
                });
              }
              resolve(this.assignedAttendees);
            });
          }
        }
      });

    this.lectureService
      .getAssigned(lectureId)
      .pipe(mergeMap(val => myPromise(val[0])))
      .subscribe(a => {
        // console.log(a);
        this.notify.dismissLoading();
        this.initSummary();
      });
    const history = this.attendanceService.getAttendance(lectureId);
    this.attendanceHistory = history;
    // console.log(history);
  }

  ionViewDidEnter() {
    this.defaultHref = `/employee/attendance`;
  }

  initSummary() {
    // get the attendees for the lecture...
    // count the number of times an attendee was present
    // loop through  all attendance, and check if the atten
    const assignedAttendees = [];

    this.attendanceHistory.subscribe(attendance => {
      if (attendance) {
        const totalAttendance = attendance.length; // total number of attendance till n day;
        // const attendees = attendance.attendees; // attendees who are present..

        let day = 0;
        const attendee = [];
        for (const iterator of attendance) {
          day++;
          const total = this.totalAttendeeAttendance(
            this.assignedAttendees,
            iterator.attendees,
            totalAttendance
          );
          assignedAttendees.push(total);
        }
        const attendanceSummary = [];

        assignedAttendees.forEach(val => {
          for (const iterator of val) {
            attendanceSummary.push(iterator);
          }
        });

        this.attendanceSummary = lod.uniq(attendanceSummary);
        // console.log(this.attendanceSummary);
      }
    });
  }

  totalAttendeeAttendance(assignedAttendees, attendees, totalAttendance) {
    const total = 0;
    assignedAttendees.map(attendee => {
      if (attendee.idNumber) {
        attendee.total = 0;
        attendee.totalAttendance = totalAttendance;
        for (const iterator of attendees) {
          if (iterator === attendee.idNumber) {
            attendee.total = attendee.total + 1;
          }
        }
      }
    });

    return assignedAttendees;
  }

  lectureHistory(attendance: any) {
    const attendees: Array<any> = attendance.attendees;
    this.showHistory = false;
    this.title = attendance.date;
    this.assignedAttendees.map(at => {
      if (at.idNumber) {
        for (const iterator of attendees) {
          if (iterator === at.idNumber) {
            at.state = true;
          }
        }
      }
    });
    this.attendees = attendance.attendees;
  }
}
