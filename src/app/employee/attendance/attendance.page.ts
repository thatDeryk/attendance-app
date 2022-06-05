import { Component, OnInit } from '@angular/core';
import { LecturesService } from 'src/app/provider/lectures/lectures.service';
import { Observable } from 'rxjs';
import { UserDataService } from 'src/app/provider/user-data/user-data.service';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss']
})
export class AttendancePage implements OnInit {
  showSearchbar: boolean;
  defaultHref = '';
  assignedLectures: Observable<any[]>;
  constructor(
    private lectureService: LecturesService,
    private userService: UserDataService
  ) {}

  async ngOnInit() {
    const emp = await this.userService.getUser('employee');

    if (!emp) {
      return;
    }
    this.assignedLectures = this.lectureService.getAssignedLectures(
      emp.idNumber
    );
  }

  ionViewDidEnter() {
    this.defaultHref = `/employee/schedule`;
  }
}
