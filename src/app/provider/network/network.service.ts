import { Injectable } from '@angular/core';
import { NotifyService } from '../notify/notify.service';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import {Subscription} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  disconnectSubscription: Subscription;
  constructor(private notification: NotifyService, private network: Network) {
    this.listenToNetWorkState();
  }

  listenToNetWorkState() {
    console.log('listing');
    try {
     this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
        console.log('network was disconnected :-(');
        this.notification.presentToast(
          'No internet connetion',
          'danger',
          'top'
        );
      });
      const connectSubscription = this.network.onConnect().subscribe(() => {
        console.log('network connected!');
        // We just got a connection but we need to wait briefly
        // before we determine the connection type. Might need to wait.
        // prior to doing any api requests as well.
        setTimeout(() => {

          if (this.network.type === 'wifi') {
            console.log('we got a wifi connection, woohoo!');
          }
        }, 3000);
      });
    } catch (e) {
      console.log(e);
      this.notification.presentToast('An error occurred', 'danger', 'top');
    }
  }

  async getNetworkStatus() {
    return await this.network.onConnect();
  }

  stopListening() {
    this.disconnectSubscription.unsubscribe();
  }
}
