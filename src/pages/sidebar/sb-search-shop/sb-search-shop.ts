import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';

import { JcxApi, UserSettings } from '../../../shared/shared';
import {SbShopDetailsPage} from "../../pages";

declare var jQuery: any;
declare var window: any;

/*
  Generated class for the SbSearchShop page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-sb-search-shop',
  templateUrl: 'sb-search-shop.html'
})
export class SbSearchShopPage {
  query_keywords: string;
  query_shoptype: string = "none";
  query_shoparea: string = "none";
  query_scope: string = "none";
  query_result_sort: string = "jcxSort";

  queryResult: any = null;


  Math: any = window.Math;

  constructor(public navCtrl: NavController, private navParams: NavParams, private jcxApi: JcxApi,
    private loadingController: LoadingController, private userSettings: UserSettings,
    private modalController: ModalController) {
    let data = navParams.data;
    if (data.keywords != null && data.keywords.replace(/^\s+|\s+$/g, '') != '') {
      this.query_keywords = data.keywords;
      this.searchShop();
    } else {
      this.restoreDataFromUsersetting();
    }
  }

  ionViewDidLoad() {
    console.log('Hello SbSearchShopPage Page');
  }

  selectShopType(sel) {
    let $ = jQuery;
    console.log(sel.target.value);
    if (sel.target.value == 'jdshop' || sel.target.value == 'tyshop') {
      $('select[name^="query_shoparea"] option:selected').attr("selected", null);
      $('select[name^="query_shoparea"] option[value="none"]').attr("selected", "selected");
      $('#query_shoparea').prop('disabled', 'disabled');
    } else {
      $('#query_shoparea').prop('disabled', false);
    }
  }

  searchShop() {
    if (this.query_keywords == null || this.query_keywords.replace(/^\s+|\s+$/g, '') == '') {
      alert("查询关键字不能为空。");
      return;
    }

    let loader = this.loadingController.create({
      content: "查询..."
    });
    loader.present().then(() => {
      this.jcxApi.newShopSearch(this.query_keywords, this.query_shoptype,
        this.query_shoparea, this.query_scope, this.query_result_sort).then(data => {
          this.queryResult = data;
          if (this.queryResult.err != '') {
            alert(this.queryResult.err);
          } else {
            this.storeData2Usersetting();
          }
          loader.dismiss();
        }).catch((e) => {
          console.log(e); loader.dismiss();
        });
    });
  }

  previousShopSearchPage() {
    let loader = this.loadingController.create({
      content: "上..."
    });
    loader.present().then(() => {
      this.jcxApi.previousShopSearchPage().then(data => {
        this.queryResult = data;
        if (this.queryResult.err != '') {
          alert(this.queryResult.err);
        } else {
          this.storeData2Usersetting();
        }
        loader.dismiss();
      }).catch((e) => {
        console.log(e); loader.dismiss();
      });
    });
  }

  nextShopSearchPage() {
    let loader = this.loadingController.create({
      content: "下..."
    });
    loader.present().then(() => {
      this.jcxApi.nextShopSearchPage().then(data => {
        this.queryResult = data;
        if (this.queryResult.err != '') {
          alert(this.queryResult.err);
        } else {
          this.storeData2Usersetting();
        }
        loader.dismiss();
      }).catch((e) => {
        console.log(e); loader.dismiss();
      });
    });
  }

  storeData2Usersetting() {
    this.userSettings.queryResult = this.queryResult;
    let tmpData: any = {};
    tmpData.query_keywords = this.query_keywords;
    tmpData.query_shoptype = this.query_shoptype;
    tmpData.query_shoparea = this.query_shoparea;
    tmpData.query_scope = this.query_scope;
    tmpData.query_result_sort = this.query_result_sort;
    this.userSettings.query_criteria = tmpData;
  }

  restoreDataFromUsersetting() {
    this.queryResult = this.userSettings.queryResult;
    if (this.userSettings.query_criteria != null) {
      this.query_keywords = this.userSettings.query_criteria.query_keywords;
      this.query_shoptype = this.userSettings.query_criteria.query_shoptype;
      this.query_shoparea = this.userSettings.query_criteria.query_shoparea;
      this.query_scope = this.userSettings.query_criteria.query_scope;
      this.query_result_sort = this.userSettings.query_criteria.query_result_sort;
    }
  }

  toSTstring(st: Number): string {
    let ret = 'tbshop';
    switch (st) {
      case 0: ret = 'tbshop'; break;
      case 1: ret = 'tmshop'; break;
      case 2: ret = 'jdshop'; break;
      default:
      case 3:
        ret = 'tyshop'; break;
    }

    return ret;
  }

  openMoreModal(shop) {
    let modal = this.modalController.create(SbShopDetailsPage, shop);
    modal.present();
  }

}
