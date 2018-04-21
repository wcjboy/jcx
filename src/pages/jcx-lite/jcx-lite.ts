import { Component, Pipe, PipeTransform } from '@angular/core';
import { NavController, Events, PopoverController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser'

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { PostsListPage, PopoverPage, SbSearchShopPage} from "../pages"
import { UserSettings, JcxApi } from '../../shared/shared';


/*

@Pipe({ name: 'safeCss'})
export class SafeCssPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    // return this.sanitized.bypassSecurityTrustHtml(value);
    return this.sanitized.bypassSecurityTrustStyle(value);
  }
}

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    // return this.sanitized.bypassSecurityTrustHtml(value);
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

*/

/*
  Generated class for the JcxLite page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-jcx-lite',
  templateUrl: 'jcx-lite.html'
})
export class JcxLitePage { 

  results: any = null;

  public taokouling: string;

  pages: Array<{ title: string, component: any }>;

  constructor(public navCtrl: NavController, private events: Events, public userSettings : UserSettings,
    private popoverController: PopoverController, private barcodeScanner: BarcodeScanner,
    private jcxApi: JcxApi) {
    console.log('JcxLitePage constructed.');
    this.pages = this.userSettings.pages;
    //this.taokouling = "default";
  }

  myMoreAction(ev) {
    let popover = this.popoverController.create(PopoverPage, { navCtrl: this.navCtrl });
    popover.present({
      ev: ev
    });
  }

  // reset the textarea conent to empty
  clear_shop() {
    this.taokouling = null;
  }

  search_shop() {
    // this.navCtrl.parent.parent.push(SbSearchShopPage, { keywords: this.keywords });
    alert(this.taokouling);

    // http://jichengxin.com/help.do
    // http://m.tb.cn/h.Wx4HxQT
    this.jcxApi.getTaobaoBaobeiPage("http://m.tb.cn/h.Wx4HxQT").then(data => {
      console.log(data);
      alert(data);
    }).catch(error => { console.log(error); });
  }

  scan_shop() {
    /*
    let barOptions = {
    };
    */

    this.barcodeScanner.scan().then((barcodeData) => {
      this.results = barcodeData;
    }, (err) => {
      // An error occurred
      alert(`扫描有错：${err}`);
    });
  }

  /*Runs when the page has loaded. This event only happens once per page being created.
   If a page leaves but is cached, then this event will not fire again on a subsequent viewing.
    The ionViewDidLoad event is good place to put your setup code for the page.
  */
  ionViewDidLoad() {
    console.log('ionViewDidLoad');
  }

  /*Runs when the page is about to enter and become the active page.*/
  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    this.events.publish('HomePage', this.pages);
  }

  /* Runs when the page has fully entered and is now the active page. 
  This event will fire, whether it was the first load or a cached page.
  */
  ionViewDidEnter() {
    // console.log('ionViewDidEnter');
  }

  /* Runs when the page is about to leave and no longer be the active page */
  ionViewWillLeave() {

  }

  /* Runs when the page has finished leaving and is no longer the active page. */
  ionViewDidLeave() {

  }

  /* 	Runs when the page is about to be destroyed and have its elements removed. */
  ionViewWillUnload() {

  }

  /* 	Runs before the view can enter. This can be used as a sort of "guard" in 
  authenticated views where you need to check permissions before the view can enter */
  ionViewCanEnter() {

  }

  /* 	Runs before the view can leave. This can be used as a sort of "guard" in authenticated views
   where you need to check permissions before the view can leave */
  ionViewCanLeave() {

  }

}
