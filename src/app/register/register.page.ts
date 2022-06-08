import {Component, OnInit} from '@angular/core';
import {MenuController, NavController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserDataService} from '../provider/user-data/user-data.service';
import {NotifyService} from '../provider/notify/notify.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
  userType: string;
  defaultHref = '';
  regForm: FormGroup;

  constructor(
    private menu: MenuController,
    private navCtrl: NavController,
    private fb: FormBuilder,
    private userService: UserDataService,
    private notify: NotifyService
  ) {
    this.regForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      idNumber: ['', Validators.compose([Validators.required])],
      fname: ['', Validators.compose([Validators.required])],
      lname: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
      confirmPassword: ['', Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('register/')[1];
    if (path!==undefined) {
      // console.log(path);
      this.userType = path;
    }
  }

  async register() {
    if (this.regForm.value.password!==this.regForm.value.confirmPassword) {
      this.notify.presentToast('Passwords Dont match', 'danger');
      return;
    }
    await this.notify.presentLoading();
    const data = {
      email: this.regForm.value.email.trim(),
      idNumber: this.regForm.value.idNumber.trim(),
      password: this.regForm.value.password,
      firstName: this.regForm.value.fname,
      lastName: this.regForm.value.lname
    };

    const validateId = this.userService
      .validateUser(this.userType, data.idNumber, data.firstName, data.lastName)
      .pipe(take(1));
    const validateIdSub = validateId.subscribe(users => {
      if (users) {
        console.log(users);

        let userAvailable = false;
        try {
          for (const iterator of users) {
            if (iterator.email) {
              if (
                iterator.idNumber===data.idNumber &&
                iterator.email.toLowerCase()===data.email.toLowerCase() &&
                iterator.name.toLowerCase()===data.firstName.toLowerCase() &&
                iterator.lastName.toLowerCase()===data.lastName.toLowerCase()
              ) {
                userAvailable = true;
              }
            }
          }
        } catch (e) {
          this.notify.presentToast('Something went wrong', 'danger');
          return;
        }

        if (!userAvailable) {
          this.notify.presentToast(
            'Not allowed, Please make sure your fullname, Idnumber is correct',
            'danger'
          );
          this.notify.dismissLoading();

          return;
        }

        if (userAvailable) {
          const checkIfRegSub = this.userService
            .checkIfReg(this.userType, data.idNumber)
            .pipe(take(1))
            .subscribe(userD => {
              if (userD.length > 0) {
                this.notify.dismissLoading();

                this.notify.presentToast('Idnumber registered', 'danger');
                return;
              }

              this.userService
                .createUser(data, this.userType)
                .then(async user => {
                  await this.notify.dismissLoading();
                  await this.notify.presentToast(
                    `A verification link sent to ${data.email}, Verify and login from app to continue`,
                    'success',
                    'top',
                    7000
                  );
                  // console.log(user);
                  validateIdSub.unsubscribe();
                  checkIfRegSub.unsubscribe();
                  this.navCtrl
                    .navigateRoot(`login/${this.userType.trim()}`)
                    .then(() => {
                    });

                  // this.menu.enable(true);
                })
                .catch(error => {
                  this.notify.dismissLoading();
                  this.notify.presentToast(error.message, 'danger', 'top');
                  console.log(error);
                });
            });
        }
      }
    });
  }

  ionViewWillEnter() {
    // this.menu.enable(false);
  }

  ionViewDidEnter() {
    this.defaultHref = `/welcome`;
  }
}
