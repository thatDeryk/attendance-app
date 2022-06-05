import { Injectable, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable, of, empty, Subscription } from 'rxjs';
import { map, isEmpty, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import * as lod from 'lodash';
import * as firebase from 'firebase/app';
import { LoadingController } from '@ionic/angular';
import { NotifyService } from '../notify/notify.service';

export interface LECTURES {
  id: string;
  name: string;
}

export interface ASSIGNED {
  employeeId: string;
  lectureId: string;
  day: string;
  start: string;
  end: string;
}
const MAX_EMPLOYEE = 2;

@Injectable({
  providedIn: 'root'
})
export class LecturesService {
  lectures: Observable<LECTURES[]>;
  data: any;
  public searchControl: FormControl;
  getAttendeeScheduleSub: Subscription;
  getAssignedSub: Subscription;
  constructor(
    private api: ApiService,
    private http: HttpClient,
    private storage: Storage,
    private noticeService: NotifyService
  ) {}

  getLectures() {
    this.lectures = this.api.colWithIds$<LECTURES>('lectures');
    return this.lectures;
  }

  getAssignedLectures(employeeId: any) {
    return this.api.colWithIds$('assigned', ref => {
      let query =  ref;
      query = query.where('employees', 'array-contains', employeeId);

      return query;
    });

    /*  const lectures = await this.assigned();
    if (lectures.empty) {
      return;
    }
    let assignedLectures = [];

    assignedLectures = lod.filter(lectures, values => {
      return lod.includes(values.employees, employeeId);
    });

    console.log(assignedLectures);

    return assignedLectures; */
  }

  getLectureName(id: string){
    return this.api.colWithIds$('lectures', ref => {
       let query =  ref;
      query = query.where('id', '==', id);

      return query;
    });

  }

  async addAttendee(selectedAttendee: any, selectedLecture: any) {
    await this.noticeService.presentLoading();
    selectedLecture.attendees.push(selectedAttendee.idNumber);
    // console.log(selectedLecture.attendees);
    return this.updateAssigned(selectedLecture.id, {
      attendees: selectedLecture.attendees
    })
      .then(() => {
        this.noticeService.dismissLoading().catch();
        this.noticeService.presentToast('Attendee added', 'success');
      })
      .catch(e => {
        this.noticeService.presentToast('An Error Occurred', 'danger');

        this.noticeService.dismissLoading().catch();
      });
    // const assigned = await this.getAssigned(s);
    /*   if (!assigned) {
      return;
    }
    console.log(assigned);
    assigned.map((values: any) => {
      console.log(values);

      if (values.lectureId === selectedLecture) {
        const attendees = values.attendees;
        console.log(values.attendees);
        if (!values.attendees) {
          values.attendee.push(selectedAttendee.id);
          return values;
        }
        if (
          values.attendees &&
          values.attendees.includes(selectedAttendee.id)
        ) {
          throw new Error('attendee exists');
          // return values;
        }
        if (
          values.attendees &&
          !values.attendees.includes(selectedAttendee.id)
        ) {
          values.attendees.push(selectedAttendee.id);
          return values;
        }
      }
    });
    this.setAssigned = assigned; */
  }

  findLectures(query: string) {
    if (query.length < 1) {
      return of([]);
    }
    return this.lectures.pipe(
      map(lecture => lecture.filter(
        value =>
          value.name.toLowerCase().indexOf(query.toLowerCase().trim()) > -1
      ))
    );
  }

  private async checkSlotEmpty(day, start, endTime) {
    const timeTable = await this.storage.get('timetable');
  }

  getAssigned(lectureId: string) {
    return this.api.colWithIds$('assigned', ref => {
       let query =  ref;
      query = query.where('lectureId', '==', lectureId);
      // .where('employees', 'array-contains', schedule.employeeId);
      return query;
    });
    // this.storage.get('assigned');
  }

  private async setAssigned(data) {
    return await this.api.add('assigned', data);
    // this.storage.set('assigned', data);
  }

  private updateAssigned(id, data) {
    return this.api.update(`assigned/${id}`, data);
  }

  private async checkIfAssigned(schedule: ASSIGNED): Promise<any> {
    return  new Promise((resolve, reject) => {
      //
      this.getAssignedSub = this.getAssigned(schedule.lectureId)
        .pipe(take(1))
        .subscribe(
          data => {
            if (data.length > 0) {
              console.log(data);
              this.getAssignedSub.unsubscribe();

              return resolve({ assigned: true, assignedData: data });
            } else {
              console.log(data);
              this.getAssignedSub.unsubscribe();

              return resolve({ assigned: false, assignedData: data });
            }
          },
          error => reject(error)
        );

      // gs.unsubscribe();
      //
    });
  }

  async updateExistingAssign(schedule: ASSIGNED, assignedData: Array<any>) {
    console.log(assignedData);
    const data = assignedData[0];
    let id: string;
    // data.map((value: any) => {
    // const employees = data.employees as Array<any>;

    id = data.id;
    // if the current empoyee is in the list of already asigned employees
    if (data.employees.includes(schedule.employeeId)) {
      // do some data manipulation to modify existing data

      for (let slot = 0; slot < data.slots.length; slot++) {
        // if the new schedule day already exist, we go ahead and check the
        // time slots for that day as well to avoid conflicts and clash,
        // however, we already implemented a logic that kinda handles the class in
        // ~this.checkIfAssigned()# method. we implement a smaller version of the logic
        // here again just incase some stuff slips through the upper logic :}

        // start matching day logic
        console.log(data.slots[slot].day === schedule.day);
        console.log(schedule.day);
        console.log(data.slots[slot].day);
        if (data.slots[slot].day.trim() === schedule.day.trim()) {
          /// check times
          const slotTime = data.slots[slot].time as Array<any>;
          // const timeConflict = slotTime.find((time: any) =>
          slotTime.forEach(time => {
            const oldScheduleStartTime: number = +time.start
              .split(':')[0]
              .trim();
            const newScheduleStartTime: number = +schedule.start
              .split(':')[0]
              .trim();
            const oldScheduleEndTime = +time.end.split(':')[0];
            const newScheduleEndTime = +schedule.end.split(':')[0].trim();

            const newScheduleStartMinutes = +schedule.start
              .split(':')[1]
              .trim();
            const slotted = [];
            let newStart = newScheduleStartTime;
            const oldStart = oldScheduleStartTime;
            const oldEnd = oldScheduleEndTime;
            const newEnd = newScheduleEndTime;

            while (newStart <= newEnd) {
              slotted.push(newStart);
              newStart++;
            }

            if (slotted.includes(oldStart)) {
              // const matchedTime = slotted.find(s => s === oldEnd);
              if (newStart === oldEnd && newScheduleStartMinutes === 0) {
                // console.log(matchedTime);
              }
              throw new Error('Schedule conflict, Start time');
            }

            if (slotted.includes(oldEnd)) {
              // const matchedTime = slotted.find(s => s === oldEnd);
              if (
                newScheduleStartTime === oldEnd &&
                newScheduleStartMinutes === 0
              ) {
                // console.log(matchedTime);
                throw new Error('Schedule conflict, End time');
              }
            }
          });

          // add new time to the matching day time slot since we have no conflict
          console.log('no conflict adding time');
          data.slots[slot].time.push({
            start: schedule.start,
            end: schedule.end
          });
          break;
          // console.log(slot);
        } // exit matching day logic
      } // end slots manipulation

      const day = data.slots.find(
        (d: any) => d.day.trim() === schedule.day.trim()
      );

      if (!day) {
        console.log(day);
        data.slots.push({
          day: schedule.day,
          time: [{ start: schedule.start, end: schedule.end }]
        });
      }
    } else {
      if (data.employees.length >= MAX_EMPLOYEE) {
        throw new Error('Cant assign: Limit for number of emplyee reached');
      }

      console.log('no employee--adding employe to lecture');
      for (let slot = 0; slot < data.slots.length; slot++) {
        // if the new schedule day already exist, we go ahead and check the
        // time slots for that day as well to avoid conflicts and clash,
        // however, we already implemented a logic that kinda handles the class in
        // ~this.checkIfAssigned()# method. we implement a smaller version of the logic
        // here again just incase some stuff slips through the upper logic :}

        // start matching day logic

        if (data.slots[slot].day.trim() === schedule.day.trim()) {
          /// check times
          const slotTime = data.slots[slot].time as Array<any>;

          // const startTime = slotTime.find((time: any) => {
          slotTime.forEach(time => {
            // new and old start
            const newScheduleStartTime = +schedule.start.split(':')[0].trim();
            const oldScheduleStartTime = +time.start.split(':')[0].trim();

            // new and old end
            const newScheduleEndTime = +schedule.end.split(':')[0].trim();
            const oldScheduleEndTime = +time.end.split(':')[0].trim();

            const newScheduleStartMinutes = +schedule.start
              .split(':')[1]
              .trim();
            // compare new start with old start;;

            const newSlotted = [];
            const oldStart = oldScheduleStartTime;

            const slotted = [];
            let newStart = newScheduleStartTime;
            // const oldStart = oldScheduleStartTime;
            const oldEnd = oldScheduleEndTime;
            const newEnd = newScheduleEndTime;

            while (newStart <= newEnd) {
              slotted.push(newStart);
              newStart++;
            }

            if (slotted.includes(oldStart)) {
              // const matchedTime = slotted.find(s => s === oldEnd);
              if (newStart === oldEnd && newScheduleStartMinutes === 0) {
                // console.log(matchedTime);
              }
              throw new Error('Schedule conflict, Start time');
            }

            if (slotted.includes(oldEnd)) {
              // const matchedTime = slotted.find(s => s === oldEnd);
              if (
                newScheduleStartTime === oldEnd &&
                newScheduleStartMinutes === 0
              ) {
                // console.log(matchedTime);
                throw new Error('Schedule conflict, End time');
              }
            }

            return (
              slotted.includes(newScheduleStartTime) &&
              slotted.includes(newScheduleEndTime)
            );
          });

          // add new time to the matching day time slot since we have no conflict
          // if (!startTime) {
          data.slots[slot].time.push({
            start: schedule.start,
            end: schedule.end
          });
          break;
          // }
          // console.log(slot);
        } // exit matching day logic
      } // end slots manipulation

      const day = data.slots.find(
        (d: any) => d.day.trim() === schedule.day.trim()
      );
      // console.log(day);
      if (!day) {
        data.slots.push({
          day: schedule.day,
          time: [{ start: schedule.start, end: schedule.end }]
        });
      }
      data.employees.push(schedule.employeeId);
    }
    // });
    console.log(data);
    await this.updateAssigned(id, data);
    return { state: true, data: data[0] };
    // return true;
  }

  timetabelData() {
    return this.api.colWithIds$('timetable');
  }

  private getScheduleSlots(schedule: ASSIGNED) {
    return this.api.colWithIds$('timetable', ref => {
       let query =  ref;
      query = query.where('day', '==', schedule.day);
      return query;
    });
  }

  private saveTimeTable(data: any) {
    return this.api.add('timetable', data);
  }

  private updateTimeTable(data: any, id?: string) {
    return this.api.update(`timetable/${data.id}`, data);
  }

  private async assignSlot(schedule: ASSIGNED, timeTableData: any) {
    return new Promise((resolve, reject) => {
      this.getAttendeeScheduleSub = this.getScheduleSlots(schedule)
        .pipe(take(1))
        .subscribe(timeTable => {
          if (timeTable.length > 0) {
            console.log(timeTable);
            timeTable.map(sch => {
              if (sch.day === schedule.day) {
                if (!sch.lectures.includes(schedule.lectureId)) {
                  sch.lectures.push(schedule.lectureId);
                }
                sch.slots.push({
                  id: schedule.lectureId,
                  taughtBy: schedule.employeeId,
                  start: schedule.start,
                  end: schedule.end
                });
              }
            });
            console.log(timeTable);
            this.updateTimeTable(timeTable[0]);
            this.getAttendeeScheduleSub.unsubscribe();
            return resolve(true);
          } else {
            console.log(timeTable);
            const tt = {
              day: schedule.day,
              lectures: [schedule.lectureId],
              slots: [
                {
                  id: schedule.lectureId,
                  taughtBy: schedule.employeeId,
                  start: schedule.start,
                  end: schedule.end
                }
              ]
            };
            this.saveTimeTable(tt);
            return resolve(false);
          }
        });
      // gs.unsubscribe();
    });
    /* const timeTable: Array<any> = await this.getScheduleSlots(schedule);
    console.log(timeTable);
    if (!timeTable) {
      const tt = [
        {
          day: schedule.day,
          slots: [
            {
              id: schedule.lectureId,
              taughtBy: schedule.employeeId,
              start: schedule.start,
              end: schedule.end
            }
          ]
        }
      ];

      // timeTable.push(tt);
      this.timetable = tt;
      return true;
    }

    const csDay = timeTable.find(day => {
      return day.day === schedule.day;
    });

    console.log(csDay);
    if (!csDay) {
      timeTable.push({
        day: schedule.day,
        slots: [
          {
            id: schedule.lectureId,
            taughtBy: schedule.employeeId,
            start: schedule.start,
            end: schedule.end
          }
        ]
      });
    } else {
      // csDay.slots.push({
      //   id: schedule.lectureId,
      //   taughtBy: schedule.employeeId,
      //   start: schedule.start,
      //   end: schedule.end
      // })
      timeTable.map(sch => {
        if (sch.day === schedule.day) {
          sch.slots.push({
            id: schedule.lectureId,
            taughtBy: schedule.employeeId,
            start: schedule.start,
            end: schedule.end
          });
        }
      });
    }
    console.log(timeTable);
    this.timetable = timeTable; */
  }

  private async assignLectureToEmployee(schedule: ASSIGNED) {
    const employees = [];
    employees.push(schedule.employeeId);
    const data = {
      employees,
      lectureId: schedule.lectureId,
      attendees: [],
      slots: [
        {
          day: schedule.day,
          time: [
            {
              start: schedule.start,
              end: schedule.end
            }
          ]
        }
      ]
    };

    try {
      return await this.setAssigned(data).then(d => this.assignSlot(schedule, data).catch(e => e));
    } catch (error) {
      return error;
    }
  }

  getSchedule(id) {
    return this.timetabelData();
  }

  async addSchedule(schedule: ASSIGNED) {
    await this.noticeService.presentLoading();
    await this.checkIfAssigned(schedule)
      .then(async resp => {
        console.log(resp);
        if (resp.assigned) {
          await this.updateExistingAssign(schedule, resp.assignedData)
            .then(async data => {
              await this.assignSlot(schedule, data);
              this.noticeService.presentToast(
                'Lecture added to schedule',
                'success',
                'top'
              );
            })
            .catch(e => {
              console.log(e);
              this.noticeService.presentToast(
                `Error: ${e.message}`,
                'danger',
                'top'
              );
            });
        } else {
          await this.assignLectureToEmployee(schedule)
            .then(() => {
              this.noticeService.presentToast(
                'Lecture added to schedule',
                'success',
                'top'
              );
            })
            .catch(e => {
              console.log(e);
              this.noticeService.presentToast(
                `Error: ${e.message}`,
                'danger',
                'top'
              );
            });
        }
      })
      .catch(e => {
        console.log(e);
        this.noticeService.presentToast(`Error: ${e.message}`, 'danger', 'top');
      });

    this.noticeService.dismissLoading().catch(e => {});
  }
}
