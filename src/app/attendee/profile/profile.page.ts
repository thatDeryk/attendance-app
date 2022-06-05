import { Component, OnInit } from '@angular/core';
import { UserDataService } from 'src/app/provider/user-data/user-data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
  userData: Promise<any>;

  constructor(private userService: UserDataService) {}

  async ngOnInit() {
    this.userData = this.userService.getUser('attendee');
  }
}
