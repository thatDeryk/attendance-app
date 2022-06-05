import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {IonicStorageModule,} from '@ionic/storage-angular';
import {Drivers} from '@ionic/storage';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {SplashScreen} from '@awesome-cordova-plugins/splash-screen/ngx';
import {environment} from 'src/environments/environment';
import {AngularFireModule} from '@angular/fire/compat';
import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {AngularFireAuthModule} from '@angular/fire/compat/auth';
import {StatusBar} from '@awesome-cordova-plugins/status-bar/ngx';
import {Network} from '@awesome-cordova-plugins/network/ngx';
import {HttpClientModule} from '@angular/common/http';
import {AttendeeRoutingModule} from 'src/app/attendee/attendee-routing.module';
import {EmployeeRoutingModule} from 'src/app/employee/employee-routing.module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {BarcodeScanner} from '@awesome-cordova-plugins/barcode-scanner/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(),
    CommonModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    }),
    EmployeeRoutingModule,
    HttpClientModule,
    AttendeeRoutingModule,
    AppRoutingModule],
  providers: [SplashScreen, Network, StatusBar,
    BarcodeScanner,
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
