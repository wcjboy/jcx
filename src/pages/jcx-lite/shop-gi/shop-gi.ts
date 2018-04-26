import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

import { PostsListPage, JcxMePage} from "../../pages"
import { JcxApi, UserSettings} from '../../../shared/shared';


declare var nicEditor: any;
declare var nicEditors: any;
declare var bkLib: any;
declare var jQuery: any;

@Component({
  selector: 'page-shop-gi',
  templateUrl: 'shop-gi.html'
})
export class ShopGiPage {
    baseUrl: string;
    nicEditorDisplay: string = "none";

    shopId: string = null;
    shopType: string = null;
    shopName: string = null;


    // local variable for jQuery
    jq: any;

    constructor(public navCtrl: NavController, private navParams: NavParams, private jcxapi: JcxApi
      , private loadingController: LoadingController, private userSettings: UserSettings) {
        let one = navParams.data;
        if(one.tbshop != null) {
            this.shopId = one.tbshop.shopId;
            this.shopName = one.tbshop.shopName;
            this.shopType = 'tbshop';
        }else if(one.tmshop != null) {
            this.shopId = one.tmshop.shopId;
            this.shopName = one.tmshop.shopName;
            this.shopType = 'tmshop';
        }
        
        


        this.baseUrl = JcxApi.baseUrl;
        this.jq = jQuery;

    }

    /*Runs when the page is about to enter and become the active page.*/
    ionViewWillEnter() {
    }

    /*Runs when the page has loaded. This event only happens once per page being created.
    If a page leaves but is cached, then this event will not fire again on a subsequent viewing.
    The ionViewDidLoad event is good place to put your setup code for the page.
    */
  ionViewDidLoad() {
    console.log('ionViewDidLoad--shop-gi');
    new nicEditor({
      buttonList: ['bold', 'italic', 'underline', 'image', 'upload', 'emoji'],
      uploadURI: this.baseUrl + '/uploadNiceFile.do',
      baseUrl: this.baseUrl
    }).panelInstance('niceShopTextArea');
  }

}