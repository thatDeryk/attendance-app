import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Storage } from '@ionic/storage';
import * as lod from 'lodash';
import * as firebase from 'firebase/app';
import { NotifyService } from '../notify/notify.service';
import { getHours, getDay } from 'date-fns';
import { DAYS_OF_WEEK } from 'angular-calendar';
@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  constructor(
    private api: ApiService,
    private storage: Storage,
    private notify: NotifyService
  ) {}

  getCode() {}
  set setAttendance(data: any) {
    this.storage.set('attendance', data);
  }
  getAttendees(idNumber: any) {
    return this.api.colWithIds$('attendee', ref => {
      let query = ref;
      query = query.where('idNumber', '==', idNumber);

      return query;
    });
  }
  async getAllHistory(lectureId: any) {}

  addAttendance(data: any) {
    return this.api.add('attendance', data);
  }

  checkAttendance(attendanceId, lectureId) {
    return this.api.docExists(`attendance/${attendanceId}`);
  }
  async createAttendance(schedule: any, slot: any, barcode: string) {
    const attendanceId = new Date(Date.now()).getTime();
    const attendanceData = {
      attendanceId,
      lectureId: slot.id,
      barcode,
      slot: {
        day: schedule.day,
        time: {
          start: slot.start,
          end: slot.end
        }
      },
      date: new Date(),
      status: 'open',
      attendees: []
    };
    console.log(attendanceData);
    this.setAttendance = attendanceData;
    const ad = await this.addAttendance(attendanceData);

    return ad.id;
  }

  getAttendance(id: string) {
    return this.api.colWithIds$('attendance', ref => {
      let query = ref;
      query = query.where('lectureId', '==', id);

      return query;
    });
  }

  async updateAttendance(code, lectureId, day, id) {
    // const attendance = await this.attendance;

    // return;
    // this.api.upsert(`attendance/${id}`, {
    //   barcode: code
    // });
    // console.log(id);
    // if (!attendance) {
    //   return;
    // }
    // attendance.map(values => {
    //   console.log(values);
    //   if (values.attendanceId === id) {
    //     const oldCode = values.barcode;
    //     values.barcode = code;
    //     if (!values.oldCodes) {
    //       values.oldCodes = [oldCode];
    //     } else {
    //       values.oldCodes.push(oldCode);
    //     }
    //     return values;
    //   }
    // });

    // Create a reference to the SF doc.
    const sfDocRef = this.api.afs.firestore.collection('attendance').doc(id);


    this.api.afs.firestore
      .runTransaction(async ( transaction) => transaction.get(sfDocRef).then(sfDoc => {
        if (!sfDoc.exists) {
          throw Error('Document does not exist!');
        }
        const oldCode = sfDoc.data().barcode;
        // const oldCodes: any;
        // if (!sfDoc.data().oldCodes) {
        //   oldCodes.push(oldCode);
        // } else {
        //   // oldCodes.push();
        //   const od = sfDoc.data().oldCodes;
        //   od.push(oldCode);
        //   console.log(od);
        // }
        console.log(code);

        transaction.update(sfDocRef, { barcode: code });
        return oldCode;
      }))
      .then(oldCode => {
        console.log('Population increased to ', oldCode);
      })
      .catch(err => {
        // This will be an "population is too big" error.
        console.error(err);
      });
  }

  async closeAttendance(attendanceId: string) {
    return this.api.update(`attendance/${attendanceId}`, {
      status: 'close'
    });
  }

  async markAttendance(code: string, id: string, idNumber: any) {
    // retrieve the doc with the extracted id
    // then check if
    // const assigned = await this.api.docExists('attem')
    const currentTime = getHours(new Date());
    const days = DAYS_OF_WEEK;
    let currentDay: string;
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

    const sfDocRef = this.api.afs.collection('attendance').doc(id).ref;

    return this.api.afs.firestore.runTransaction(async transaction => transaction.get(sfDocRef).then((sfDoc: any) => {
        if (!sfDoc.exists) {
          throw Error('Document does not exist!');
        }
        const slotEnd = +sfDoc.data()?.slot.time.end.split(':')[0];

        const lAttendees: Array<any> = sfDoc.data().attendees;
        if (lAttendees.includes(idNumber)) {
          this.notify.presentToast(`You've signed`, 'warning', 'top');
          throw new Error(`You've signed`);
        }

        if (currentDay.toLowerCase() !== sfDoc.data().slot.day.toLowerCase()) {
          // cant generate attendance// not allowed
          throw new Error('Attendance expired');
          // return;
        }

        if (currentTime > slotEnd) {
          throw new Error('Attendance expired');
        }

        if (sfDoc.data().barcode !== code) {
          throw Error('invalid code!');
        }

        if (sfDoc.data().status !== 'open') {
          throw Error('Attendance closed!');
        }

        lAttendees.push(idNumber);

        return transaction.update(sfDocRef, { attendees: lAttendees });
      }));
    // .then(attendes => {
    //   // console.log('Population increased to ', oldCode);
    // })
    // .catch(err => {
    //   // This will be an "population is too big" error.
    //   console.error(err);
    // });
  }

  genBarCode(code) {
    return this.api.get(
      `https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${code}`
    );
  }
}
