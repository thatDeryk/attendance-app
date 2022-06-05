import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { interval, Subscription, Observable } from 'rxjs';
import { AttendanceService } from 'src/app/provider/attendance/attendance.service';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.page.html',
  styleUrls: ['./qr-code.page.scss']
})
export class QrCodePage implements OnInit, OnDestroy {
  lectureId: string;
  codeGenerated: boolean;
  dateCoded: string;
  intervalSub: Subscription;
  imgCode: Observable<any>;
  constructor(
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {}
  async ionViewWillEnter() {
    await (
      await this.loadingCtrl.create({message: 'Please wait', id: '1'})
    ).present();

    const code = this.route.snapshot.paramMap.get('lectureId');
    console.log(code);
    // this.imgCode = this.attendanceService.genBarCode(code);
    // this.imgCode
    this.dateCoded = code;
    this.lectureId = code.split('?')[1];
    // const codeInterval = interval(10000);

    // date
    //  this.intervalSub = codeInterval.subscribe(() => {
    // this.dateCoded = `${new Date(Date.now()).toUTCString()}?${
    //   code.split('?')[3]
    // }?${code.split('?')[2]}?${this.lectureId}`.trim();
    this.attendanceService.updateAttendance(
      this.dateCoded,
      this.lectureId,
      code.split('?')[2],
      code.split('?')[3]
    );
    // });

    await this.loadingCtrl.dismiss('', '', '1');
    this.codeGenerated = true;
  }

  ngOnDestroy() {
    // this.intervalSub.unsubscribe();
  }
}
