import { Component, ViewChild } from '@angular/core';
import { NavController, Tabs, Events } from 'ionic-angular';

import { JcxHomePage, JcxTradePage, JcxForumPage, JcxMePage } from '../pages';
import { UserSettings } from '../../shared/shared';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  @ViewChild('myTabs') tabRef: Tabs;

  homeRoot: any = JcxHomePage;
  tradeRoot: any = JcxTradePage;
  forumRoot: any = JcxForumPage;
  meRoot: any = JcxMePage;

  constructor(public navCtrl: NavController, private events: Events,
    private userSettings: UserSettings) { }

  ionViewDidEnter() {
    // console.log(this.tabRef.getSelected());
    // console.log('Tab ionViewWillEnter: ' + this.tabRef.getSelected().index);
    console.log('Tab ionViewWillEnter: ' + this.tabRef.selectedIndex);
    switch (this.tabRef.selectedIndex) {
      case 0:
        this.events.publish('HomePage', this.userSettings.pages);
        break;
      case 1:
        this.events.publish('TradePage', this.userSettings.pages);
        break;
      case 2:
        this.events.publish('ForumPage', this.userSettings.pages);
        break;
      case 3:
        this.events.publish('MePage', this.userSettings.pages);
        break;
      default:
        break;
    }
  }

}
