import { Component, OnInit } from '@angular/core';
import { UserDataService } from 'src/app/provider/user-data/user-data.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss']
})
export class MyProfilePage implements OnInit {
  userData: Promise<any>;
  constructor(private userService: UserDataService) {}

  async ngOnInit() {
    this.userData = this.userService.getUser('employee');
  }
}
