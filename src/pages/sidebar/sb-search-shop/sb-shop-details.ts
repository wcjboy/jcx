
import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';


@Component({
  selector: 'page-sb-shop-details',
  templateUrl: 'sb-shop-details.html'
})

export class SbShopDetailsPage {
  shop: any;

  constructor(
    public navParams: NavParams,
    public viewController: ViewController
  ) {
    // console.log(navParams.data);
    this.shop = navParams.data;
  }

  dismiss() {
    this.viewController.dismiss();
  }
}