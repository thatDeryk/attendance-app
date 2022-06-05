import { Component, OnInit } from '@angular/core';
import { AttendanceService } from 'src/app/provider/attendance/attendance.service';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.page.html',
  styleUrls: ['./attendance-history.page.scss']
})
export class AttendanceHistoryPage implements OnInit {
  defaultHref = '';
  attendanceHistory: any;
  showHistory = true;
  attendees: any;
  title = new Date();
  user: any;
  attended: boolean;
  totalAttendance: any;
  myAttendance: any;
  constructor(
    private attendanceService: AttendanceService,
    private route: ActivatedRoute,
    private storage: Storage
  ) {}

  async ngOnInit() {
    this.user = await this.storage.get('attendee');
    console.log(this.user);

    const lectureId = this.route.snapshot.paramMap.get('lectureId');
    console.log(lectureId);
    const history = this.attendanceService.getAttendance(lectureId);
    this.attendanceHistory = history;
    history.subscribe(hist => {
      console.log(hist);
      this.totalAttendance = hist.length;
      let myTotal = 0;
      if (hist) {
        hist.forEach(a => {
          const tt = a.attendees.filter(val => val === this.user.idNumber);
          myTotal = myTotal + tt.length;
        });
      }
      console.log(myTotal);
      this.myAttendance = myTotal;
    });
  }

  initSummary() {}
  ionViewDidEnter() {
    this.defaultHref = `/attendee/attendance`;
  }

  lectureHistory(attendance: any) {
    console.log(attendance);
    this.showHistory = false;
    this.title = attendance.date;
    const attd: Array<any> = attendance.attendees;
    if (attd.includes(this.user.idNumber)) {
      this.attended = true;
    }
  }
}
