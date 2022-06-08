import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import * as lod from 'lodash';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AttendeeService {
  attendees: Observable<any>;

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private storage: Storage
  ) {}
  getAttendees() {
    const attendees = this.api.colWithIds$<any>('attendee');
    attendees.subscribe();
    return (this.attendees = attendees);
    // return this.lectures;
    // if (this.attendees) {
    //   console.log('sd');
    //   return this.attendees;
    // } else {
    //   return this.http
    //     .get('assets/data/schedule.json')
    //     .pipe(
    //       map((data: any) => {
    //         // console.log(data);
    //         this.attendees = of(data.attendees);
    //       })
    //     )
    //     .subscribe();
    // }
  }
  findAttendee(query: string) {
    if (query.length < 1) {
      return of([]);
    }
    return this.attendees.pipe(
      map(attendee => {
        return attendee.filter(
          value =>
          {
            if(value.idNumber){
               return value?.idNumber.toLowerCase().indexOf(query.toLowerCase().trim()) >
              -1;
            }
          }
        );
      })
    );
  }

  getAttendeeLectures(idNumber: string): Observable<any> {
    return this.api.colWithIds$('assigned', ref => {
      let query = ref;
      query = query.where('attendees', 'array-contains', idNumber);
      return query;
    });
  }

  getAttendeeTimetable(lectureId: string) {
    return this.api.colWithIds$('timetable', ref => {
      let query = ref;
      query = query.where('lectures', 'array-contains', lectureId);
      return query;
    });
  }
}
