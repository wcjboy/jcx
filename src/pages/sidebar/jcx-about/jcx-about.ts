import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { UserSettings } from '../../../shared/shared';

/*
  Generated class for the JcxAbout page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-jcx-about',
  templateUrl: 'jcx-about.html'
})
export class JcxAboutPage {

  constructor(public navCtrl: NavController, private events: Events,
    private userSettings: UserSettings) { }

  /*Runs when the page is about to enter and become the active page.*/
  ionViewWillEnter() {
    console.log('About ionViewWillEnter');
  }

}
