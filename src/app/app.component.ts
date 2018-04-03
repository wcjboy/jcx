import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push } from '@ionic-native/push';

import { TabsPage } from '../pages/pages';
import { UserSettings } from '../shared/shared';

@Component({
  templateUrl: 'app.html'
})
export class JcxApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = TabsPage;


  pages: Array<{ title: string, icon: string, component: any }> = [];

  constructor(public platform: Platform,
    private events: Events, private userSettings: UserSettings,
    public alertController: AlertController, private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      //Splashscreen.hide();

      this.pages = this.userSettings.pages;

      this.events.subscribe('HomePage', userEventData => this.pages = userEventData);
      this.events.subscribe('TradePage', userEventData => this.pages = userEventData);
      this.events.subscribe('ForumPage', userEventData => this.pages = userEventData);
      this.events.subscribe('MePage', userEventData => this.pages = userEventData);

      // prepare for the FCM Push service
      /*

      
      try {
        let push = Push.init({
          android: {
            senderID: "640116486163"
          },
          ios: {
            alert: "true",
            badge: false,
            sound: "true"
          },
          windows: {}
        });
        push.on('registration', (data) => {
          console.log("device token ->", data.registrationId);
          //TODO - send device token to server
        });
        push.on('notification', (data) => {
          console.log('message', data.message);
          let self = this;
          //if user using app and push notification comes
          if (data.additionalData.foreground) {
            // if application open, show popup
            let confirmAlert = this.alertController.create({
              title: '新通知',
              message: data.message,
              buttons: [{
                text: '忽略',
                role: 'cancel'
              }, {
                text: '查看',
                handler: () => {
                  //TODO: Your logic here
                  //self.nav.push(DetailsPage, { message: data.message });
                  console.log("程序在打开状态，查看新消息");
                }
              }]
            });
            confirmAlert.present();
          } else {
            //if user NOT using app and push notification comes
            //TODO: Your logic on click of push notification directly
            // self.nav.push(DetailsPage, { message: data.message });
            console.log("程序在未打开状态，查看新消息");
          }
        });
        push.on('error', (e) => {
          console.log(e.message);
        });
      }
      catch (err) {
        // Code to handle exception
        console.log("Exception in Push initialization!!!");
        console.log(err);
      }

      */


    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    // this.nav.setRoot(page.component);
    this.nav.push(page.component);
  }
}
