import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

import { TradePostsListPage, JcxMePage} from "../../pages"
import { JcxApi, UserSettings} from '../../../shared/shared';

declare var nicEditor: any;
declare var nicEditors: any;
declare var bkLib: any;
declare var jQuery: any;

@Component({
  selector: 'page-trade-forum-show',
  templateUrl: 'trade-forum-show.html'
})
export class TradeForumShowPage {

  forumId: Number;
  forumName: string;
  forumPage: any = null;
  baseUrl: string;
  nicEditorDisplay: string = "none";
  pagesMap: Map<number, any> = new Map<number, any>();

  subjectField: string = "";

// local variable for jQuery
  jq: any;

  public static TYPE_NORMAL: Number = 0;
  public static TYPE_STICKY: Number = 1;
  public static TYPE_ANNOUNCE: Number = 2;
  public static TYPE_DIGEST: Number = 3;
  public static TYPE_SOLDOUT: Number = -5;

  public static STATUS_UNLOCKED: Number = 0;
  public static STATUS_LOCKED: Number = 1;

  constructor(public navCtrl: NavController, private navParams: NavParams, private jcxapi: JcxApi
    , private loadingController: LoadingController, private userSettings: UserSettings) {
    let forum = navParams.data;
    this.forumId = forum.id;
    this.forumName = forum.name;
    this.baseUrl = JcxApi.baseUrl;
    this.jq = jQuery;
    console.log(this.forumId + ":" + this.forumName);
  }

  /*Runs when the page is about to enter and become the active page.*/
  ionViewWillEnter() {
    if (this.userSettings.user == null) {
      this.nicEditorDisplay = "none";
    } else {
      this.nicEditorDisplay = "";
    }

    if (this.forumPage != null) {
      return;
    }
    let loader = this.loadingController.create({
      content: "加载..."
    });
    loader.present().then(() => {
      this.jcxapi.getTopicsInForum(this.forumId, 0).then(data => {
        this.forumPage = this.transformForumData(data);
        // TODO: maybe we need to set the limitation of the map size
        this.pagesMap.set(this.forumPage.thisPage, this.forumPage);
        loader.dismiss();
      }).catch(error => {console.log(error); loader.dismiss();});
    });
  }

  previousPage(thisPage, recordsPerPage) {
    if(this.pagesMap.get(thisPage - 1) != undefined) {
        this.forumPage = this.pagesMap.get(thisPage - 1);
        return;
    }
    let loader = this.loadingController.create({
      content: "加载..."
    });
    loader.present().then(() => {
      this.jcxapi.getTopicsInForum(this.forumId, (thisPage - 2) * recordsPerPage).then(data => {
        this.forumPage = this.transformForumData(data);
        this.pagesMap.set(this.forumPage.thisPage, this.forumPage);
        loader.dismiss();
      }).catch(error => {console.log(error); loader.dismiss();});
    });
  }

  nextPage(thisPage, recordsPerPage) {
    if(this.pagesMap.get(thisPage + 1) != undefined) {
        this.forumPage = this.pagesMap.get(thisPage + 1);
        return;
    }
    let loader = this.loadingController.create({
      content: "加载..."
    });
    loader.present().then(() => {
      this.jcxapi.getTopicsInForum(this.forumId, thisPage * recordsPerPage).then(data => {
        this.forumPage = this.transformForumData(data);
        this.pagesMap.set(this.forumPage.thisPage, this.forumPage);
        loader.dismiss();
      }).catch(error => {console.log(error); loader.dismiss();});
    });
  }

  transformForumData(data): any {
    if (data == null) {
      return data;
    }
    let oneTitle;
    for (let i = 0; i < data.topics.length; i++) {
      oneTitle = "";
      switch (data.topics[i].type) {
        case TradeForumShowPage.TYPE_ANNOUNCE:
          oneTitle += '<span style="color:#F96E02">【公告】</span>';
          break;
        case TradeForumShowPage.TYPE_STICKY:
          oneTitle += '<span style="color:#F96E02">【置顶】</span>';
          break;
        case TradeForumShowPage.TYPE_DIGEST:
          oneTitle += '<span style="color:#F96E02">【精品】</span>';
          break;
        case TradeForumShowPage.TYPE_SOLDOUT:
          oneTitle += '<span style="color:#F96E02">【售完】</span>';
          break;
      }
      oneTitle += data.topics[i].title;
      oneTitle += '<span style="color:limegreen;">&nbsp;&nbsp;'
        + this.jcxapi.getShortTimeFormat(data.topics[i].lastPostTime) + '</span>';

      data.topics[i].oneTitle = oneTitle;
    }
    return data;
  }

  openTradeTopic(topic) {
    console.log(topic.id);
    this.navCtrl.push(TradePostsListPage, topic);
    // console.log(this.navCtrl.parent);
    // this.navCtrl.parent.parent.push(ForumShowPage, forumId);
  }

/*Runs when the page has loaded. This event only happens once per page being created.
 If a page leaves but is cached, then this event will not fire again on a subsequent viewing.
  The ionViewDidLoad event is good place to put your setup code for the page.
*/
  ionViewDidLoad() {
    console.log('ionViewDidLoad--trade-forum-show');
    new nicEditor({
      buttonList: ['bold', 'italic', 'underline', 'image', 'upload', 'emoji'],
      uploadURI: this.baseUrl + '/uploadNiceFile.do',
      baseUrl: this.baseUrl
    }).panelInstance('niceTradeTopicTextArea');
  }

  sendNewTradeTopic() {
    if (this.userSettings.user == null) {
      alert("您未登录，请到个人中心登录");
      this.navCtrl.push(JcxMePage);
    } else {
      if (this.subjectField.replace(/^\s*|\s*$/g, "").length == 0) {
				alert("主题不能为空！");
				return false;
			}

      let messageStr;

      let nicE = new nicEditors.findEditor('niceTradeTopicTextArea');
      messageStr = nicE.getContent();
      if (messageStr.replace(/<p>|<\/p>|<br\s*>|<br\s*\/>|&nbsp;/g, "").replace(/^\s*|\s*$/g, "").length == 0) {
        alert("内容不能为空！");
        return false;
      }

      messageStr = messageStr.replace(/src="nice\//g, 'src="/nice/')
        .replace(/url\(nice/g, 'url(/nice');

      let loader = this.loadingController.create({
        content: "发送..."
      });
      loader.present().then(() => {
        this.jcxapi.sendNewTopic(this.forumId, this.subjectField, messageStr).then(data => {
          let result: any = data;
          if (result.errorMessage != null) {
            alert(result.errorMessage);
          } else {
            alert("发表新主题成功！");
            nicE.setContent('');
            this.subjectField = "";
            this.forumPage = null;
            this.pagesMap.clear();
            this.jq('#newTradeTopic').slideUp(); this.jq('#openNewTradeTopic').slideDown();
            this.ionViewWillEnter();
          }

          loader.dismiss();
        }).catch(error => { alert(error); console.log(error); loader.dismiss(); });
      });
    }
  }

}
