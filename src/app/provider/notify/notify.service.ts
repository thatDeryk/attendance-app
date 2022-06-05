import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';

export interface Msg {
  content: string;
  style: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  loading: any;
  private msgSource = new Subject<Msg>();
  msg = this.msgSource.asObservable();

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  update(content: string, style: string) {
    const msg: Msg = { content, style };
    this.msgSource.next(msg);
  }

  clear() {
    this.msgSource.next();
  }

  async presentLoading(message?: string, duration?: number) {
    this.loading = await this.loadingCtrl.create({
      animated: true,
      duration,
      message: message || 'Please wait...',
      spinner: 'bubbles'
    });

    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss().catch((e: any) => console.log(e));
    }
  }

  public async presentToast(
    msg: string,
    color: string,
    pos?: 'top' | 'middle' | 'bottom',
    dur?: number,
    css?: string
  ) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: dur || 3000,
      position: pos || 'top',
      color,
      cssClass: css,
      buttons: [
        {
          text: 'close',
          side: 'end',
          handler: () => {
            toast.dismiss();
          }
        }
      ]
    });
    await toast.present();
  }
}
