import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import {
  getHours,
  setHours,
  set,
  isBefore,
  toDate,
  differenceInHours,
  isSameHour,
  getTime,
  getMinutes, addDays,
} from 'date-fns';
import { LecturesService } from 'src/app/provider/lectures/lectures.service';
import parse from 'date-fns/parse';
import { UserDataService } from 'src/app/provider/user-data/user-data.service';
import { isEmpty } from 'lodash';

const TODAY = new Date();
@Component({
  selector: 'app-add-lecture-modal',
  templateUrl: './add-lecture-modal.component.html',
  styleUrls: ['./add-lecture-modal.component.scss'],
})
export class AddLectureModalComponent implements OnInit {
  scheduleForm: FormGroup;
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  dayStartHour = 9;
  startDatetimeMin = new Date().toLocaleTimeString(); // '2022-03-28T08:00:00.429Z';
  endDatetimeMax =  addDays(new Date(), 10).toLocaleTimeString(); //new Date().toDateString(); // '2022-03-28T17:00:00.429Z';
  lectureData;
  user: any;
  constructor(
    public modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private changeDet: ChangeDetectorRef,
    private lectureService: LecturesService,
    private userService: UserDataService
  ) {
    // this.startDatetimeMin = set(new Date(), {
    //   hours: 8,
    //   minutes: 0
    // }).toISOString();
    // this.endDatetimeMax = set(new Date(), {
    //   hours: 20,
    //   minutes: 0
    // }).toISOString(); // sets the 30 days from the current date time
    console.log(this.startDatetimeMin);
    console.log(this.endDatetimeMax);

    this.scheduleForm = this.formBuilder.group({
      // location: ['', Validators.compose([Validators.required])],
      startTime: ['', Validators.compose([Validators.required])],
      endTime: ['', Validators.compose([Validators.required])],
      day: ['', Validators.compose([Validators.required])],
      // numberOfDays: [
      //   '',
      //   Validators.compose([
      //     Validators.required,
      //     Validators.min(1),
      //     Validators.max(5)
      //   ])
      // ],
      // schedule: this.formBuilder.array([])
    });
    console.log(this.dayStartHour);
  }
  async ngOnInit() {
    console.log(this.lectureData);
    this.user = await this.userService.getUser('employee');
  }

  get startTime() {
    return this.scheduleForm.get('startTime');
  }

  get endTime() {
    return this.scheduleForm.get('endTime');
  }

  startTimeChange(event) {
    // console.log(event.target.value);
    const startTime = new Date(event.target.value);
    let endTime = this.endTime.value;
    if (!endTime) {
      return; // endtime value is empty terminate method
    }
    endTime = new Date(this.endTime.value);
    const resp = this.validateStartAndEndTime(
      startTime,
      endTime,
      this.startTime
    );
    console.log(resp);
    if (resp.state) {
      this.endTime.setErrors(null);
      this.endTime.markAsPristine();
      this.endTime.markAsTouched();
      // this.endTime.setValue()

      this.scheduleForm.updateValueAndValidity();
    }
    this.changeDet.detectChanges();
  }

  endTimeChange(event) {
    const endTime = new Date(event.target.value);
    let startTime = this.startTime.value;
    console.log('sewe');
    if (!startTime) {
      return;
    }
    startTime = new Date(this.startTime.value);

    const resp = this.validateStartAndEndTime(startTime, endTime, this.endTime);
    if (resp.state) {
      this.startTime.setErrors(null);
      this.startTime.markAsPristine();
      this.scheduleForm.updateValueAndValidity({
        onlySelf: true,
      });
    }
    this.changeDet.detectChanges();

    // if resp.value
  }

  // TODO Use async validators instead

  validateStartAndEndTime(
    startTime: number | Date,
    endTime: number | Date,
    control: AbstractControl
  ): {
    state: boolean;
    value: number;
    con: string;
  } {
    // null is returned if the endtime is before the star time else return the hour difference between the start and endtime
    const startTimeIsbeforeEndTime = isBefore(startTime, endTime)
      ? differenceInHours(endTime, startTime)
      : null;
    console.log(startTimeIsbeforeEndTime);

    if (startTimeIsbeforeEndTime === null) {
      control.setErrors({
        startIsBefore: true,
      });
      return {
        state: false,
        value: startTimeIsbeforeEndTime,
        con: 'nan',
      };
    }
    // if same hour, Huston we have a problem
    if (isSameHour(startTime, endTime)) {
      control.setErrors({
        isSameHour: true,
      });
      return {
        state: false,
        value: startTimeIsbeforeEndTime,
        con: 'same',
      };
    }

    if (startTimeIsbeforeEndTime === 0) {
      control.setErrors({
        timeDifference: true,
      });
    }

    return {
      state: true,
      value: startTimeIsbeforeEndTime,
      con: 'fine',
    };
  }

  submitForm(form: FormGroup) {
    // value manipulation to get the desired format such as 17:00
    const startTime = form.value.startTime;
    if(isEmpty(startTime) && isEmpty(form.value.endTime)) { return}
    const startHr =  form.value.startTime.split(':')[0]; //getHours(new Date(form.value.startTime));
    let startMn =  form.value.startTime.split(':')[1]; //getMinutes(new Date(form.value.startTime)).toString();
    if (startMn === '0') {
      startMn = `0${startMn}`;
    }
    const mergeStartTime = `${startHr}:${startMn}`;

    const endHr = form.value.endTime.split(':')[0]; //getHours(new Date(form.value.endTime));
    let endMn = form.value.endTime.split(':')[1]; //getMinutes(new Date(form.value.endTime)).toString();

    if (endMn === '0') {
      endMn = `0${endMn}`;
    }

    const mergeEndTime = `${endHr}:${endMn}`;
    if (!this.user) {
      return;
    }

    const schedule = {
      employeeId: this.user.idNumber,
      lectureId: this.lectureData.id,
      room: form.value.location,
      start: mergeStartTime,
      end: mergeEndTime,
      day: form.value.day,
    };

    this.lectureService.addSchedule(schedule);
  }

  selectDay(event) {
    console.log(event.target.value);
    // this.schedules.push(this.formBuilder.control(''));
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
