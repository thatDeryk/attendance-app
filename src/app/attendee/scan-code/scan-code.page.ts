import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { NotifyService } from 'src/app/provider/notify/notify.service';
import { AttendanceService } from 'src/app/provider/attendance/attendance.service';
import { Storage } from '@ionic/storage';
import { AttendeeService } from 'src/app/provider/attendee/attendee.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-scan-code',
  templateUrl: './scan-code.page.html',
  styleUrls: ['./scan-code.page.scss']
})
export class ScanCodePage implements OnInit {
  isScannerReady: false;
  qrcode: string;
  errorMessage: string;
  error = false;
  attendeeIdNumber: any;
  canSign: boolean;
  attendanceSub: Subscription;
  signed: boolean;
  constructor(
    private storage: Storage,
    private barcodeScanner: BarcodeScanner,
    private notify: NotifyService,
    private attendanceService: AttendanceService,
    private attendeeService: AttendeeService,
    private router: Router
  ) {}

  async ngOnInit() {
    const attendee = await this.storage.get('attendee');

    if (!attendee) {
      return;
    }

    if (!attendee.idNumber) {
      return;
    }
    this.attendeeIdNumber = attendee.idNumber;

    // check if the attendee is registered to the
    this.attendanceSub = this.attendeeService
      .getAttendeeLectures(this.attendeeIdNumber)
      .pipe(take(1))
      .subscribe(
        lectures => {
          console.log(lectures);

          if (lectures.length > 0) {
            this.canSign = true;
            this.startScanner(lectures);
          } else {
            this.canSign = false;
            this.notify.presentToast('Permission denied', 'danger', 'top');
            // this.router.navigateByUrl('attendee/home').catch(e => {});
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  startScanner(lectures: Array<any>) {
    this.error = false;
    this.barcodeScanner
      .scan()
      .then(barcodeData => {
        this.qrcode = barcodeData.text;
        console.log(this.qrcode);
        const lectureId = this.qrcode.split('?')[1];
        console.log(lectureId);
        const isLecture = lectures.find(
          lecture => lecture.lectureId === lectureId
        );

        console.log(isLecture);
        if (!isLecture) {
          this.notify.presentToast('Not enrolled to lecture', 'danger', 'top');
          this.router.navigateByUrl('attendee/home').catch(e => {});
          return;
        }
        this.continue();
      })
      .catch(err => {
        this.errorMessage = 'An error occurred';
        this.error = true;
      });
  }

  async continue() {
    if (!this.qrcode) {
      // this.notifyService.presentToast('Please scan QRCode', 'top', 'danger');
      this.errorMessage = 'An error occurred';
      this.error = true;
      return;
    }
    await this.notify.presentLoading();

    if (!this.attendeeIdNumber) {
      return;
    }
    const code = this.qrcode.toString().trim();
    const docId = code.split('?')[3];
    console.log(docId);
    this.attendanceService
      .markAttendance(code, docId, this.attendeeIdNumber)
      .then(data => {
        console.log(data);
        this.signed = true;
        this.notify.dismissLoading();
        setTimeout(() => {
          this.router.navigateByUrl('attendee/home').catch();
        }, 50000);
      })
      .catch(error => {
        this.notify.dismissLoading();
        this.notify.presentToast(
          `${error.message || 'An Error occurred'}`,
          'danger',
          'top'
        );
        this.errorMessage = error.message || 'An error occurred';
        this.error = true;
      });
  }
}
