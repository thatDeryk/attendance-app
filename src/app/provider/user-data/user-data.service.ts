import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ApiService } from '../api/api.service';
import { ToastController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  HAS_LOGGED_IN = 'hasLoggedIn';
  constructor(
    public storage: Storage,
    private api: ApiService,
    private toastCtrl: ToastController
  ) { }

  async darkTheme(){
    return await this.storage.get('isDarkTheme');
  }

  async saveDarkTheme(isDarkTheme: boolean){
   await this.storage.set('isDarkTheme', isDarkTheme);
  }

  async loginDemo(user, userType) {
    await this.storage.set(this.HAS_LOGGED_IN, userType);
    await this.setUsername(user, userType);
    return window.dispatchEvent(new CustomEvent(`${userType}:login`));
  }

  async login(user: any, userType): Promise<any> {
    return await this.api.auth
      .signInWithEmailAndPassword(user.email, user.password)
      .then(async userData => {
        if (userData.user.uid) {
          if (userData.user.emailVerified) {
            const ud = await this.getUserDbData(userData.user.uid, userType);

            console.log(ud.data());
            if (ud.exists) {
              await this.storage.set(this.HAS_LOGGED_IN, userType);
              await this.setUsername(ud.data(), userType);
              return window.dispatchEvent(new CustomEvent(`${userType}:login`));
            } else {
              this.toast(`No ${userType} info found`, 'danger');
              this.api.auth.signOut();
              throw Error('User not found');
            }
          } else {
            throw Error('Please verify your account');
          }
        }
      })
      .catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        let errorMessage = error.message;

        switch (errorCode) {
          case 'auth/invalid-email':
            errorMessage = 'User not found';
            break;

          case 'auth/wrong-password':
            errorMessage = 'Incorrect Password';
            break;

          case 'auth/user-not-found':
            errorMessage = 'Incorrect email.';
            break;

          default:
            break;
        }
        // if (errorCode === 'auth/wrong-password') {
        //   this.toast('Wrong password.', 'danger');
        // } else {
        //   this.toast(errorMessage, 'danger');
        // }
        // console.log(error);
        throw Error(errorMessage);
      });
  }

  async isLoggedIn(): Promise<string> {
    const value = await this.storage.get(this.HAS_LOGGED_IN);
    return value;
  }

  logout(userType): Promise<any> {
    return this.storage
      .remove(this.HAS_LOGGED_IN)
      .then(() => {
        this.api.auth.signOut();
        return this.storage.remove(userType);
      })
      .then(() => {
        window.dispatchEvent(new CustomEvent(`${userType}:logout`));
      });
  }

  setUsername(user: any, userType): Promise<any> {
    return this.storage.set(userType, user);
  }
  getUser(user: string) {
    return this.storage.get(user);
  }

  getUserDbData(id: string, userType: string) {
    return this.api
      .doc(`${userType}/${id}`)
      .get()
      .toPromise();
  }

  getDataEmployee(idNumber: any) {

  }
  async createUser(regData: any, userType) {
    let data: any;
    if (!userType) {
      this.toast('Opps something went wrong', 'danger');
      throw Error('userType_not_defined');
    }


    this.validateUser(userType, regData.idNumber, '', '').pipe(take(1)).subscribe(async d => {

      if (userType === 'employee') {
        let roomNumber = '';
        let faculty = '';
        let phoneNumber = '';
        if (d.length > 0) {
          faculty = d[0].faculty;
          phoneNumber = d[0].phoneNumber;
          roomNumber = d[0].roomNumber;
        }

        data = {
          email: regData.email,
          firstName: regData.firstName,
          lastName: regData.lastName,
          idNumber: regData.idNumber,
          faculty,
          roomNumber,
          phoneNumber
        };

        await this.userCreation(data, regData, userType);


      } else if (userType === 'attendee') {

        let faculty = '';
        if (d.length > 0) {
          faculty = d[0].faculty;
        }

        data = {
          email: regData.email,
          idNumber: regData.idNumber,
          firstName: regData.firstName,
          lastName: regData.lastName,
          faculty
        };

        await this.userCreation(data, regData, userType);
      }

    });

  }


  validateUser(type: string, id: string, firstName: string, lastName: string) {
    return this.api.colWithIds$(`${type}Data`, ref => {
      let query = ref;
      query = query.where('idNumber', '==', id);
      return query;
    });
  }

  checkIfReg(type: string, id: string) {
    return this.api.colWithIds$(`${type}`, ref => {
      let query = ref;
      query = query.where('idNumber', '==', id);
      return query;
    });
  }

  private async toast(message: string, color: string, duration?) {
    const t = await this.toastCtrl.create({
      color,
      message,
      position: 'top',
      duration: 7000
    });
    t.present();
  }

  private async userCreation(data: any, regData: any, userType: string) {
    console.log(data);
    this.api.auth
      .createUserWithEmailAndPassword(regData.email, regData.password)
      .then(async resp => {
        if (resp.user.uid) {
          const currentUser = this.api.auth.currentUser;
           currentUser.then( res => {
             res.sendEmailVerification().then( rs => {
               data.id = resp.user.uid;
               this.api
                 .set(`${userType}/${resp.user.uid}`, data)
                 .then(async vd => {
                   // console.log(res);
                   // await this.storage.set(this.HAS_LOGGED_IN, userType);
                   // await this.setUsername(data, userType);
                   // return window.dispatchEvent(new CustomEvent(`${userType}:login`));
                 });
             });
           });

        }
      })
      .catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === 'auth/weak-password') {
          this.toast('The password is too weak.', 'danger');
        } else {
          this.toast(errorMessage, 'danger');
        }
        console.log(error);
        if (this.api.auth.currentUser) {
          this.api.auth.currentUser.then( res => res.delete());
        }
        throw Error(errorMessage);
      });
  }

}
