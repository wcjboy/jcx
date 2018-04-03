import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the SbRankList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sb-rank-list',
  templateUrl: 'sb-rank-list.html'
})
export class SbRankListPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello SbRankListPage Page');
  }

}
