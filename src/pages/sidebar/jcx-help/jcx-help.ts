import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the JcxHelp page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-jcx-help',
  templateUrl: 'jcx-help.html'
})
export class JcxHelpPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello JcxHelpPage Page');
  }

}
