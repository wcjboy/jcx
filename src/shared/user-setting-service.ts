import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';
import { JcxApi } from './jcx-api-service';

import {
  SbIneedCommentPage, SbSearchShopPage, SbBrowseShopPage, SbRankListPage,
  JcxHelpPage, JcxAboutPage, JcxContactPage
} from '../pages/pages';

@Injectable()
export class UserSettings {

  private static UPDATE_INTERVAL = 600 * 1000; // 10 minutes
  private static LATEST_DAYS_MS = 3 * 24 * 3600 * 1000; // within 3 days
  private static TRADE_CATEGORY_ID = 14;

  public allinone: any = null;
  public allCategories: any = null;

  private pingTasker: any = null;

  public pages: Array<{ title: string, icon: string, component: any }> = [
    { title: '我要评价', icon: 'text', component: SbIneedCommentPage },
    { title: '搜索/排序网店', icon: 'search', component: SbSearchShopPage },
    { title: '浏览分类网店', icon: 'browsers', component: SbBrowseShopPage },
    { title: '排行榜/指数', icon: 'list', component: SbRankListPage },
    { title: '帮助中心', icon: 'help', component: JcxHelpPage },
    { title: '关于', icon: 'information-circle', component: JcxAboutPage },
    { title: '联系我们', icon: 'mail', component: JcxContactPage }
  ];

  public user: any = null;

  // The below members data is temporarily stored for shop search
  public query_criteria: {
    query_keywords: string,
    query_shoptype: string,
    query_shoparea: string,
    query_scope: string,
    query_result_sort: string
  } = null;
  public queryResult: any = null;

  constructor(private storage: Storage, private jcxApi: JcxApi, private alertController: AlertController) {
    console.log('UserSettings is constructed.');
    storage.get('allinone').then(val => {
      if (val != null) {
        this.allinone = val;
        console.log('allinone is loaded from storage!');
      }
    }).catch(error => { console.log(error); });

    storage.get('allCategories').then(val => {
      if (val != null) {
        this.allCategories = this.checkNewInAllCategories(val);;
        console.log('allCategories is loaded from storage!');
      }
    }).catch(error => { console.log(error); });

    storage.get('jcxuser').then(val => {
      if (val != null) {
        let user_: any = val;
        console.log('user info is loaded from storage!');
        if (user_.username && user_.passwd) {
          this.jcxApi.login(user_.username, user_.passwd).then(data => {
            let loginRes: any = data;
            if (loginRes.validateStatus == 'Ok') {
              // login sucessful
              loginRes.user.passwd = user_.passwd;
              this.user = loginRes.user;
              // this.set('jcxuser', loginRes.user);
              console.log("Relogin ok!");
            } else {
              // login failed
              this.user = null;
            }
          }).catch(error => { console.log(error); });
        }
      }
    }).catch(error => { console.log(error); });


    this.pingTask();
    this.scheduleTask();
  }

  // stop the cycle
  stopScheduleTask() {
    if (this.pingTasker != null) {
      clearInterval(this.pingTasker);
    }
  }


  // start the cycle
  scheduleTask() {
    this.pingTasker = setInterval(() => {
      this.pingTask();
    }, UserSettings.UPDATE_INTERVAL);
  }

  pingTask() {
    // obtain allinone data
    this.jcxApi.getMobileHomeData().then(data => {
      this.allinone = this.checkAllInOne_Data(data);
      this.storage.set('allinone', this.allinone);
      console.log("pingTask of allinone is done!");
    }).catch(error => { console.log(error); });

    // obtain allCategories data
    this.jcxApi.getForumList().then(data => {
      this.allCategories = this.checkNewInAllCategories(data);
      this.storage.set('allCategories', this.allCategories);
      console.log("pingTask of allCategories is done!");
    }).catch((e) => {
      console.log(e);
    });

  }

  // persistent store key-value
  setKeyVal(key: string, val: any) {
    this.storage.set(key, val).then(data => { })
      .catch((e) => { console.log(e); })
  }

  clearAllKeyVal() {
    this.storage.clear().then(data => { })
      .catch((e) => { console.log(e); })
  }

  getAllNonTradeCategories() {
    return this.allCategories.filter((item) => {
      return item.id != UserSettings.TRADE_CATEGORY_ID;
    });
  }

  getAllTradeCategories() {
    return this.allCategories.filter((item) => {
      return item.id == UserSettings.TRADE_CATEGORY_ID;
    });
  }



  checkNewInAllCategories(data): any {
    if (data == null) {
      return data;
    }
    let current = Date.now();
    for (let i = 0; i < data.length; i++) {
      data[i].isNew = false;
      for (let j = 0; j < data[i].forums.length; j++) {
        if (data[i].forums[j].lpi != null &&
          data[i].forums[j].lpi.postTimeMillis != null &&
          current - data[i].forums[j].lpi.postTimeMillis < UserSettings.LATEST_DAYS_MS) {
          data[i].forums[j].isNew = true;
          data[i].isNew = true;
        } else {
          data[i].forums[j].isNew = false;
        }
      }
    }
    return data;
  }

  showAlert(title_: string, subTitle_: string) {
    let alert = this.alertController.create({
      title: title_,
      subTitle: subTitle_,
      buttons: ['好']
    });
    alert.present();
  }

  /*  modify the <img> src attributes value , which is retrieved from server
  */
  checkAllInOne_Data(data: any): any {
    if (data != null) {
      for (let i = 0; i < data.recentShopTopics.length; i++) {
        let item = data.recentShopTopics[i];
        if (item.logo.startsWith("//")) {
          data.recentShopTopics[i].logo = "http:" + data.recentShopTopics[i].logo;
        } else if (item.logo.startsWith("/")) {
          data.recentShopTopics[i].logo = data.recentShopTopics[i].logo.substr(1);
        }
      }

      for (let i = 0; i < data.topShopForums.length; i++) {
        let item = data.topShopForums[i];
        if (item.logo.startsWith("//")) {
          data.topShopForums[i].logo = "http:" + data.topShopForums[i].logo;
        } else if (item.logo.startsWith("/")) {
          data.topShopForums[i].logo = data.topShopForums[i].logo.substr(1);
        }
      }
      // allinone.tiList
      for (let i = 0; i < data.tiList.length; i++) {
        let item = data.tiList[i];
        if (item.imgSrc.startsWith("//")) {
          data.tiList[i].imgSrc = "http:" + data.tiList[i].imgSrc;
        } else if (item.imgSrc.startsWith("/")) {
          data.tiList[i].imgSrc = JcxApi.baseUrl + data.tiList[i].imgSrc;
        }
      }

      if (data.pi1 != null && data.pi1.imgSrc != null) {
        if (data.pi1.imgSrc.startsWith("//")) {
          data.pi1.imgSrc = "http:" + data.pi1.imgSrc;
        } else if (data.pi1.imgSrc.startsWith("/")) {
          data.pi1.imgSrc = JcxApi.baseUrl + data.pi1.imgSrc;
          // console.log(data.pi1.imgSrc);
        }
      }
      if (data.pi2 != null && data.pi2.imgSrc != null) {
        if (data.pi2.imgSrc.startsWith("//")) {
          data.pi2.imgSrc = "http:" + data.pi2.imgSrc;
        } else if (data.pi2.imgSrc.startsWith("/")) {
          data.pi2.imgSrc = JcxApi.baseUrl + data.pi2.imgSrc;
          // console.log(data.pi2.imgSrc);
        }
      }
      if (data.pi3 != null && data.pi3.imgSrc != null) {
        if (data.pi3.imgSrc.startsWith("//")) {
          data.pi3.imgSrc = "http:" + data.pi3.imgSrc;
        } else if (data.pi3.imgSrc.startsWith("/")) {
          data.pi3.imgSrc = JcxApi.baseUrl + data.pi3.imgSrc;
          // console.log(data.pi3.imgSrc);
        }
      }

    }
    return data;
  }
}