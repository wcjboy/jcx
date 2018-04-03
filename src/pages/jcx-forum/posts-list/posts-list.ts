import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

import { JcxApi, UserSettings } from '../../../shared/shared';
import { JcxMePage } from "../../pages"

declare var nicEditor: any;
declare var nicEditors: any;
declare var bkLib: any;
declare var neUserListMapObj: any;
// - http://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript

@Component({
  selector: 'page-posts-list',
  templateUrl: 'posts-list.html'
})
export class PostsListPage {

  topic: any;
  topicPage: any = null;
  pagesMap: Map<number, any> = new Map<number, any>();
  baseUrl: string;
  nicEditorDisplay: string = "none";
  neId: string = 'niceTextArea';

  constructor(public navCtrl: NavController, public userSettings: UserSettings,
    private navParams: NavParams, private jcxapi: JcxApi
    , private loadingController: LoadingController) {

    this.topic = navParams.data;
    this.baseUrl = JcxApi.baseUrl;
    if (!(this.topic.startNum != null)) {
      this.topic.startNum = 0;
    }
    if (!(this.topic.postId != null)) {
      this.topic.postId = null;
    }
    console.log(this.topic.id + ":" + this.topic.title);
  }

  /*Runs when the page is about to enter and become the active page.*/
  ionViewWillEnter() {
    if (this.userSettings.user == null) {
      this.nicEditorDisplay = "none";
    } else {
      this.nicEditorDisplay = "";
    }
    if (this.topicPage != null) {
      return;
    }
    let loader = this.loadingController.create({
      content: "加载..."
    });
    loader.present().then(() => {
      this.jcxapi.getPostsInTopic(this.topic.id, this.topic.startNum, this.topic.postId).then(data => {
        this.topicPage = this.transformTopicData(data);

        // TODO: maybe we need to set the limitation of the map size
        this.pagesMap.set(this.topicPage.thisPage, this.topicPage);
        loader.dismiss();
      }).catch(error => { console.log(error); loader.dismiss(); });
    });
  }

  previousPage(thisPage, recordsPerPage) {
    if (this.pagesMap.get(thisPage - 1) != undefined) {
      this.topicPage = this.pagesMap.get(thisPage - 1);
      return;
    }
    let loader = this.loadingController.create({
      content: "加载..."
    });
    loader.present().then(() => {
      this.jcxapi.getPostsInTopic(this.topic.id, (thisPage - 2) * recordsPerPage, null).then(data => {
        this.topicPage = this.transformTopicData(data);
        this.pagesMap.set(this.topicPage.thisPage, this.topicPage);
        loader.dismiss();
      }).catch(error => { console.log(error); loader.dismiss(); });
    });
  }

  nextPage(thisPage, recordsPerPage) {
    if (this.pagesMap.get(thisPage + 1) != undefined) {
      this.topicPage = this.pagesMap.get(thisPage + 1);
      return;
    }
    let loader = this.loadingController.create({
      content: "加载..."
    });
    loader.present().then(() => {
      this.jcxapi.getPostsInTopic(this.topic.id, thisPage * recordsPerPage, null).then(data => {
        this.topicPage = this.transformTopicData(data);
        this.pagesMap.set(this.topicPage.thisPage, this.topicPage);
        loader.dismiss();
      }).catch(error => { console.log(error); loader.dismiss(); });
    });
  }

  transformTopicData(data): any {
    if (data == null) {
      return data;
    }
    for (let i = 0; i < data.posts.length; i++) {
      data.posts[i].text = data.posts[i].text
        .replace(/src="\/upload/g, 'src="' + JcxApi.baseUrl + "/upload")
        .replace(/src="\/\//g, 'src="http://')
        .replace(/src="\/nice\//g, 'src="nice/')
        .replace(/url\(\/nice/g, 'url(nice');

      data.posts[i].longtext = '<b style="color:blue;">' + data.posts[i].postUsername + '</b>'
        + '<span style="color:limegreen;">&nbsp;&nbsp;'
        + this.jcxapi.getShortTimeFormat(data.posts[i].formattedTime) + '</span><br>'
        + data.posts[i].text;
    }
    this.topic.forumId = data.forumId;
    // prepare the user list array for nicEditor , atmoumou
    let userlistArr = new Array();
    for(let i = 0; i < data.userList.length; i++) {
      userlistArr.push([ data.userList[i].id, data.userList[i].username]);
    }
    neUserListMapObj[this.neId] = userlistArr;

    return data;
  }


  /*Runs when the page has loaded. This event only happens once per page being created.
 If a page leaves but is cached, then this event will not fire again on a subsequent viewing.
  The ionViewDidLoad event is good place to put your setup code for the page.
*/
  ionViewDidLoad() {
    console.log('ionViewDidLoad--post-list');
    new nicEditor({
      buttonList: ['bold', 'italic', 'underline', 'image', 'upload', 'emoji', 'atmoumou'],
      uploadURI: this.baseUrl + '/uploadNiceFile.do',
      baseUrl: this.baseUrl
    }).panelInstance(this.neId);
  }

  // send the post to one forum topic
  sendNewReply() {
    if (this.userSettings.user == null) {
      alert("您未登录，请到个人中心登录");
      this.navCtrl.push(JcxMePage);
    } else {
      let messageStr;
      let nicE = new nicEditors.findEditor(this.neId);
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
        this.jcxapi.sendNewReply(this.topic.forumId, this.topic.id, this.topic.startNum, messageStr).then(data => {
          let result: any = data;
          if (result.errorMessage != null) {
            alert(result.errorMessage);
          } else {
            this.topicPage = this.transformTopicData(data);
            // TODO: maybe we need to set the limitation of the map size
            this.pagesMap.set(this.topicPage.thisPage, this.topicPage);
            nicE.setContent('');
          }

          loader.dismiss();
        }).catch(error => { alert(error); console.log(error); loader.dismiss(); });
      });
    }
  }

}
