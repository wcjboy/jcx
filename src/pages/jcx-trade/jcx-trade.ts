import { Component } from '@angular/core';
import { NavController, PopoverController} from 'ionic-angular';

import { TradeForumShowPage, TradePostsListPage, PopoverPage} from "../pages"
import { UserSettings } from '../../shared/shared';

/*
  Generated class for the JcxTrade page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-jcx-trade',
  templateUrl: 'jcx-trade.html'
})
export class JcxTradePage {

  
  constructor(public navCtrl: NavController,  public userSettings: UserSettings,
    private popoverController: PopoverController) {
  }

  openTradeForum(forum) {
    console.log(forum.id);
    this.navCtrl.push(TradeForumShowPage, forum);
    // console.log(this.navCtrl.parent);
    // this.navCtrl.parent.parent.push(ForumShowPage, forumId);
  }

  myMoreAction(ev) {
    let popover = this.popoverController.create(PopoverPage, { navCtrl: this.navCtrl });
    popover.present({
      ev: ev
    });
  }

  openTradeTopic(tradeImage) {
    let topic: any = {};
    topic.id = tradeImage.topicId;
    topic.title = tradeImage.subject;
    topic.startNum = tradeImage.startNum;
    console.log(topic.id);
    this.navCtrl.push(TradePostsListPage, topic);
  }
}
