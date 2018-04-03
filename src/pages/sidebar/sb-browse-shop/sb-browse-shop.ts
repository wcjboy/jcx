import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the SbBrowseShop page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sb-browse-shop',
  templateUrl: 'sb-browse-shop.html'
})
export class SbBrowseShopPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello SbBrowseShopPage Page');
  }

}
