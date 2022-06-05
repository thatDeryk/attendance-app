import { Component, OnInit } from '@angular/core';
import { AttendeeService } from 'src/app/provider/attendee/attendee.service';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss']
})
export class AttendancePage implements OnInit {
  attendeeLectures: Observable<any>;
  showSearchbar: boolean;

  constructor(
    private storage: Storage,
    private attendeeService: AttendeeService
  ) {}

  async ngOnInit() {
    const attendee = await this.storage.get('attendee');

    if (!attendee) {
      return;
    }
    this.attendeeLectures = this.attendeeService.getAttendeeLectures(
      attendee.idNumber
    );
  }
}
