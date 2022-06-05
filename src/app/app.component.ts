import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { Platform, NavController, MenuController } from '@ionic/angular';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { Router, NavigationEnd, RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { NetworkService } from './provider/network/network.service';

import { UserDataService } from './provider/user-data/user-data.service';
import { NotifyService } from './provider/notify/notify.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public menu: Observable<any>;
  public dark = false;

  public employee = [
    {
      title: 'Schedule',
      url: '/employee/schedule',
      icon: 'calendar',
    },
    {
      title: 'Track Attendance',
      url: '/employee/attendance',
      icon: 'file-tray-full',
    },
    {
      title: 'Add Lecture',
      url: '/employee/lecture',
      icon: 'book',
    },
    {
      title: 'Add Attendee',
      url: '/employee/attendees',
      icon: 'man',
    },
    {
      title: 'My Profile',
      url: '/employee/profile',
      icon: 'person',
    },
  ];

  public attendee = [
    {
      title: 'Go to schedule',
      url: '/attendee/home',
      icon: 'calendar',
    },
    {
      title: 'Track attendance',
      url: '/attendee/attendance',
      icon: 'file-tray-full',
    },
    {
      title: 'Mark attendance',
      url: '/attendee/scan-code',
      icon: 'checkmark',
    },
    {
      title: 'My Profile',
      url: '/attendee/profile',
      icon: 'person',
    },
  ];

  url: string;
  userType: string;
  user: any;
  name: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private networkService: NetworkService,
    private notify: NotifyService,
    private navCtrl: NavController,
    public userData: UserDataService,
    public menuCtrl: MenuController,
    private storage: Storage
  ) {
    // this.router.events
    //   .pipe(filter(e => e instanceof NavigationEnd))
    //   .subscribe((e: RouterEvent) => {
    //     const urls = e.url;
    //     const paths = urls.split('/');
    //     const path = paths.find(val => val === 'attendee');
    //     console.log(path);

    //     if (e.url.match('/attendee')) {
    //       this.menu = of(this.attendee);
    //     } else if (e.url.match('/employee')) console.log();
    //   });
    this.initializeApp();

  }

  async initializeApp() {
    await this.storage.create();

    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.dark = await this.userData.darkTheme();
    /*  const state = await this.networkService.getNetworkStatus();
      console.log(state);
      if (!state.connected) {
        this.notify.presentToast(
          'No internet connetion',
          'danger',
          'bottom',
          7000,
          'not-internet'
        );
      }*/
    });
  }

  checkLoginStatus() {
    return this.userData.isLoggedIn().then((userType) => {
      console.log(userType);
      return this.updateLoggedInStatus(userType);
    });
  }

  listenForLoginEvents() {
    window.addEventListener('attendee:login', () => {
      this.updateLoggedInStatus('attendee');
    });
    window.addEventListener('attendee:signup', () => {
      this.updateLoggedInStatus('signup');
    });
    window.addEventListener('attendee:logout', () => {
      this.updateLoggedInStatus('logout');
    });

    window.addEventListener('employee:login', () => {
      this.updateLoggedInStatus('employee');
    });

    window.addEventListener('employee:signup', () => {
      this.updateLoggedInStatus('signup');
    });

    window.addEventListener('employee:logout', () => {
      this.updateLoggedInStatus('logout');
    });
  }

  async changeTheme() {
    console.log( this.dark);
    this.dark = !this.dark;
   await this.userData.saveDarkTheme(this.dark);
  }

  async updateLoggedInStatus(userType: string) {
    switch (userType) {
      case 'attendee':
        // await this.menuCtrl.enable(true);
        this.userType = userType;
        this.menu = of(this.attendee);
        this.name = (await this.userData.getUser(userType)).firstName;
        break;

      case 'employee':
        // await this.menuCtrl.enable(true);

        this.userType = userType;
        this.menu = of(this.employee);
        this.name = (await this.userData.getUser(userType)).firstName;

        break;

      default:
        this.userType = null;
        this.menuCtrl.enable(false);

        break;
    }
    // setTimeout(() => {
    //   this.userType = userType;

    // }, 300);
  }

  ngOnInit() {
    this.checkLoginStatus();
    this.listenForLoginEvents();
  }

  logout() {
    this.userData.logout(this.userType).then(() => {
      this.navCtrl.navigateRoot('welcome');
    });
  }
}
