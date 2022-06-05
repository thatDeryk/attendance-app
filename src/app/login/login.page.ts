import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { UserDataService } from '../provider/user-data/user-data.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotifyService } from '../provider/notify/notify.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  userType: string;
  defaultHref = '';
  loginForm: FormGroup;
  constructor(
    public menu: MenuController,
    private navCtrl: NavController,
    private userData: UserDataService,
    private fb: FormBuilder,
    private notify: NotifyService
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('login/')[1];
    if (path !== undefined) {
      // console.log(path);
      this.userType = path;
    }
  }

  async login(userType: string) {
    // this.userData
    //   .loginDemo({ firstName: 'ali', lastName: 'job' }, this.userType)
    //   .then(d => {
    //     this.navCtrl.navigateRoot(`${userType.trim()}`).then(() => {});

    //     this.menu.enable(true);
    //   });

    // return;
    await this.notify.presentLoading();
    await this.userData
      .login(this.loginForm.value, this.userType)
      .then(user => {
        console.log(user);
        this.notify.dismissLoading();

        this.navCtrl.navigateRoot(`${userType.trim()}`).then(() => {});

        this.menu.enable(true);
      })
      .catch(error => {
        this.notify.dismissLoading();
        this.notify.presentToast(
          `${error.message}` || 'An error occured',
          'danger',
          'top'
        );

        console.log(error);
      });
  }

  ionViewDidEnter() {
    this.defaultHref = `/welcome`;
  }

  ionViewWillEnter() {
    this.menu.enable(false);
  }
}
