import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'attendee/home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'attendee/lectures',
    loadChildren: () =>
      import('./lectures/lectures.module').then(m => m.LecturesPageModule)
  },
  {
    path: 'attendee/profile',
    loadChildren: () =>
      import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'attendee/attendance/attendance-history/:lectureId',
    loadChildren: () =>
      import('./attendance-history/attendance-history.module').then(
        m => m.AttendanceHistoryPageModule
      )
  },
  {
    path: 'attendee/attendance',
    loadChildren: () =>
      import('./attendance/attendance.module').then(m => m.AttendancePageModule)
  },
  {
    path: 'attendee/scan-code',
    loadChildren: () =>
      import('./scan-code/scan-code.module').then(m => m.ScanCodePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendeeRoutingModule {}
