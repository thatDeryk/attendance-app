import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss']
})
export class WelcomePage implements OnInit {
  constructor(private menu: MenuController) {}

  ngOnInit() {}

  ionViewWillEnter() {
    // this.menu.enable(false);
  }
}
