import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'employee/schedule',
    pathMatch: 'full'
  },
  {
    path: 'employee/schedule',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'employee/timetable',
    loadChildren: () =>
      import('./timetable/timetable.module').then(m => m.TimetablePageModule)
  },
  {
    path: 'employee/attendees',
    loadChildren: () =>
      import('./attendees/attendees.module').then(m => m.AttendeesPageModule)
  },
  {
    path: 'employee/attendees/attendee-details/:attendeeId',
    loadChildren: () =>
      import('./attendee-details/attendee-details.module').then(
        m => m.AttendeeDetailsPageModule
      )
  },
  {
    path: 'employee/attendance',
    loadChildren: () =>
      import('./attendance/attendance.module').then(m => m.AttendancePageModule)
  },
  {
    path: 'employee/attendance/attendance-history/:lectureId',
    loadChildren: () =>
      import('./attendance-history/attendance-history.module').then(
        m => m.AttendanceHistoryPageModule
      )
  },
  {
    path: 'employee/profile',
    loadChildren: () =>
      import('./my-profile/my-profile.module').then(m => m.MyProfilePageModule)
  },
  {
    path: 'employee/lecture',
    loadChildren: () =>
      import('./lecture/lecture.module').then(m => m.LecturePageModule)
  },
  {
    path: 'employee/qr-code/:lectureId',
    loadChildren: () =>
      import('./qr-code/qr-code.module').then(m => m.QrCodePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule {}
