import { Component } from '@angular/core';
import { NavController, LoadingController, PopoverController, NavParams, ViewController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { UserSettings, JcxApi } from '../../shared/shared';
import { JcxChatPage, JcxNativePage } from "../pages"

// popover page
@Component({
  template: `
    <ion-list>
      <button ion-item color="primary" (click)="gotoScanPage()"><ion-icon name="qr-scanner"></ion-icon>&nbsp;&nbsp;扫一扫</button>
    </ion-list>
  `
})
export class PopoverPage {
  parentNavCtrl: NavController = null;
  constructor(public navCtrl: NavController, private viewController: ViewController,
    private navParams: NavParams) {
    this.parentNavCtrl = navParams.data.navCtrl;
  }

  ionViewDidLoad() {
    console.log('PopoverPage Page loaded.');
  }

  gotoScanPage() {
    /*
    if (this.parentNavCtrl != null) {
      this.parentNavCtrl.push(JcxNativePage);
    } else {
      this.navCtrl.push(JcxNativePage);
    }
    */

    this.navCtrl.push(JcxNativePage);

    this.viewController.dismiss();
  }

/*
  gotoZbarPage() {
    this.navCtrl.push(JcxZbarPage);
    this.viewController.dismiss();
  }
  */
}




@Component({
  selector: 'page-jcx-me',
  templateUrl: 'jcx-me.html'
})
export class JcxMePage {

  public username: string;
  public passwd: string;
  public loginRes: any;
  baseUrl: string;

  constructor(public navCtrl: NavController, public userSettings: UserSettings,
    public jcxApi: JcxApi, private loadingController: LoadingController,
    private popoverController: PopoverController, private iab: InAppBrowser) {
    this.baseUrl = JcxApi.baseUrl;
  }

  ionViewDidLoad() {
    console.log('Hello JcxMePage Page');
  }

  myMoreAction(ev) {
    let popover = this.popoverController.create(PopoverPage, { navCtrl: this.navCtrl });
    popover.present({
      ev: ev
    });
  }

  gotoRealtimeChatRoom() {
    this.navCtrl.push(JcxChatPage);
  }

  logout() {
    this.userSettings.user = null;

    /*
    let loader = this.loadingController.create({
      content: "退出..."
    });
    loader.present().then(() => {
      this.jcxApi.logout(this.userSettings.user.id).then(data => {
        // TODO
  
        loader.dismiss();
      }).catch(error => {console.log(error); loader.dismiss();});
    });
    */
  }

  // login into one acccount
  login(username: string, passwd: string) {
    console.log('login: ' + username + " , " + passwd);
    let loader = this.loadingController.create({
      content: "登录..."
    });
    loader.present().then(() => {
      this.jcxApi.login(username, passwd).then(data => {
        this.loginRes = data;
        if (this.loginRes.validateStatus == 'Ok') {
          this.loginRes.user.passwd = passwd;
          this.userSettings.user = this.loginRes.user;
          let jcxuser: any = {};
          jcxuser.username = this.userSettings.user.username;
          jcxuser.passwd = this.userSettings.user.passwd;
          this.userSettings.setKeyVal('jcxuser', jcxuser);
          this.userSettings.showAlert('确认消息', '登录成功！');
          // console.log(this.userSettings.user);
        }
        loader.dismiss();
      }).catch(error => { console.log(error); loader.dismiss(); });
    });
  }

  clearAllCachedData() {
    this.userSettings.clearAllKeyVal();
  }

  gotoInAppBrowser() {
    let content : string = "http://jichengxin.com/mobile/index.html?mobileORpc=mobile";

    //let browser = new InAppBrowser(content, '_blank');
    let browser = this.iab.create(content, '_blank');
  }
}
