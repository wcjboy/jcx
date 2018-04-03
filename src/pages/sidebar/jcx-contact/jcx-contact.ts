import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the JcxContact page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-jcx-contact',
  templateUrl: 'jcx-contact.html'
})
export class JcxContactPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello JcxContactPage Page');
  }

}
