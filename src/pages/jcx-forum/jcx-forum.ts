import { Component } from '@angular/core';
import { NavController, Slides, Platform, LoadingController, PopoverController } from 'ionic-angular';

import { ForumShowPage, PostsListPage, PopoverPage} from "../pages"
import { UserSettings, JcxApi } from '../../shared/shared';

/*
  Generated class for the JcxForum page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-jcx-forum',
  templateUrl: 'jcx-forum.html'
})
export class JcxForumPage {

  slideHeight: Number = 230;
  mySlideOptions = {
    autoplay: 4000,  // 4 seconds
    initialSlide: 0,
    loop: true
  };

  constructor(public navCtrl: NavController, public userSettings: UserSettings,
    private platform: Platform, private jcxApi: JcxApi, private loadingController: LoadingController,
    private popoverController: PopoverController) {
    platform.ready().then((readySource) => {
      console.log('Width: ' + platform.width());
      this.slideHeight = platform.width() * 0.6;
    });
  }

  /*Runs when the page is about to enter and become the active page.*/
  ionViewWillEnter() {
    /*
    console.log('ionViewWillEnter');
    if (this.allCategories != null) {
      return;
    }
    let loader = this.loadingController.create({
      content: "加载..."
    });
    loader.present().then(() => {
      this.jcxapi.getForumList().then(data => {
        this.allCategories = this.checkNewInAllCategories(data);
        loader.dismiss();
      }).catch((e) => {
        console.log(e); loader.dismiss();
      });
    });
    */
  }

  openForum(forum) {
    console.log(forum.id);
    this.navCtrl.push(ForumShowPage, forum);
    // console.log(this.navCtrl.parent);
    // this.navCtrl.parent.parent.push(ForumShowPage, forumId);
  }

  openTopic(postImage) {
    let topic: any = {};
    topic.id = postImage.topicId;
    topic.title = postImage.subject;
    topic.startNum = postImage.startNum;
    console.log(topic.id);
    this.navCtrl.push(PostsListPage, topic);
  }

  myMoreAction(ev) {
    let popover = this.popoverController.create(PopoverPage, { navCtrl: this.navCtrl });
    popover.present({
      ev: ev
    });
  }

}
