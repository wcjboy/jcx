import { Component, Pipe, PipeTransform } from '@angular/core';
import { NavController, Events, PopoverController, LoadingController, Loading } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser'
import { Platform } from 'ionic-angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';
// import { Clipboard } from '@ionic-native/clipboard';


import { PostsListPage, PopoverPage, SbSearchShopPage, ShopGiPage} from "../pages"
import { UserSettings, JcxApi } from '../../shared/shared';

// "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"

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
  tburl: string = null;
  shopId: string = null;
  shopName: string = null;
  shopType: string = null;

  public taokouling: string;

  isDone: boolean = false;

  pages: Array<{ title: string, component: any }>;

  constructor(public navCtrl: NavController, private events: Events, public userSettings : UserSettings,
    private popoverController: PopoverController, private barcodeScanner: BarcodeScanner,
    private jcxApi: JcxApi, public loadingCtrl: LoadingController, 
    public platform: Platform) {
    // private clipboard: Clipboard, public platform: Platform) {
    console.log('JcxLitePage constructed.');
    this.pages = this.userSettings.pages;
    //this.taokouling = "default";

    platform.ready().then(() => {
      if (platform.is('cordova')){
        //Subscribe on pause
        this.platform.pause.subscribe(() => {
          //Hello pause
        });
        //Subscribe on resume
        this.platform.resume.subscribe(() => {
          //---- resume start
          /*
          this.clipboard.paste().then(
            (resolve: string) => {
              console.log(resolve);
             },
             (reject: string) => {
               console.log('Error: ' + reject);
             }
           );
           */
           //---- resume end
        });
       }
    });
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
    if(this.taokouling == null) {
      alert("请粘贴宝贝在手淘里的分享代码或者宝贝的网址或者店铺的网址。");
      return;
    }
    this.search_shop_internal(this.taokouling);
  }

  async search_shop_internal(input : string) {
    this.isDone = false;
    let loading = this.loadingCtrl.create({
      content: '请稍候...'
    }); 
    loading.present();
    var tbShortUrlRegExp = /\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/i;
    var tbShortUrlMatch = input.match(tbShortUrlRegExp);
    if(tbShortUrlMatch == null) {
      // ￥VIdJ0srrZJL￥
      var koulingRegExp = /￥(\w+)￥/i;
      var koulingMatch = input.match(koulingRegExp);
      if(koulingMatch == null) {
        alert("既无淘宝地址，也无淘口令。");
        this.isDone = true;
      }else {
        this.convertTaokoulingToUrl(koulingMatch[1]);
      }
    }else {
      this.jcxApi.getUrlContentViaJcx(tbShortUrlMatch[0]).then(data => {
        //console.log(data);
        var dataStr = <string>data;
        var tburlRegExp = /var\s+url\s*=\s*['"]([^'"]*)['"]/i;
        var tburlMatch = dataStr.match(tburlRegExp);
        if(tburlMatch != null) {
          console.log(tburlMatch[1]);
          this.tburl = tburlMatch[1];
          this.findShopIdName(this.tburl);
        }   
      }).catch(error => { console.log(JSON.stringify(error)); alert('获取店铺ID失败-1');this.isDone = true; });
    }
    while (!this.isDone) {
      await this.delay(100);
    }
   loading.dismiss();
  }

  convertTaokoulingToUrl(tkl: string) {
    this.jcxApi.getUrlContentViaJcx("http://api.w4.org.cn/api/detkl.php?tkl=" + tkl).then(data => {
      //console.log(data);
      var dataStr = <string>data;
			var tburlRegExp = /"url":"([^"]*)"/i;
      var tburlMatch = dataStr.match(tburlRegExp);
      if(tburlMatch != null) {
        this.tburl = tburlMatch[1].replace(/\\\//g, "/");
        console.log(this.tburl);
        this.findShopIdName(this.tburl);
      }
    }).catch(error => { console.log(JSON.stringify(error)); alert('获取店铺ID失败-3'); this.isDone = true; });
  }

  findShopIdName(url: string) {
    this.shopId = null; this.shopName = null; this.shopType = null;
    this.jcxApi.getUrlContentViaJcx(url).then(data  => {
      var dataStr = <string>data; //JSON.stringify(data);
      var shopIdNameRegExp = /var\s+g_config\s*=\s*{[\s\S]*shopId\s*:\s*['"]([^'"]*)['"][\s\S]*shopName\s*:\s*['"]([^'"]*)['"]/i;
      var shopIdNameMatch = dataStr.match(shopIdNameRegExp);
      if(shopIdNameMatch != null) {
        this.shopId = shopIdNameMatch[1];
        this.shopType = "tbshop";
        this.shopName = this.unicodeToChar(shopIdNameMatch[2]);
        this.results = this.shopId + " | " + this.shopName + " | " + this.shopType;
        console.log(this.results);
      }else {
        this.shopType = "tmshop";
        var re = /shopId=(\d+);/i;
        var reMatch = dataStr.match(re);
        if(reMatch != null) {
          this.shopId = reMatch[1];
        }
        re = /<a\s+class="slogo-shopname"[^<>]*><strong>(.*)<\/strong><\/a>/i;
        reMatch = dataStr.match(re);
        if(reMatch != null) {
          this.shopName = reMatch[1];
        }
        this.results = this.shopId + " | " + this.shopName + " | " + this.shopType;
        console.log(this.results);
      }
      this.retrieveShopGI(this.shopType, this.shopName, this.shopId);      
    }).catch(error => { console.log(JSON.stringify(error)); alert('获取店铺ID失败-2');this.isDone = true;});
  }

  retrieveShopGI(shoptype: string, shopname: string, shopid: string) {
    if(shopid == null || shopname == null || shoptype == null) {
      this.isDone = true;
      return;
    }
    // obtain allCategories data
    this.jcxApi.getShopGI(shoptype, shopname, shopid).then(data => {
      let one : any = data;
      this.isDone = true;
      if(one.tbshop == null && one.tmshop == null) {
        alert("没有该店铺数据。" + shopid + " | " + shopname + " | " + shoptype);
        return;
      }
      this.openShopGIPage(data);
    }).catch((e) => {
      console.log(e);
      this.isDone = true;
    });
  }

  // open shop general info page
  openShopGIPage(data) {
    this.navCtrl.push(ShopGiPage, data);
    // console.log(this.navCtrl.parent);
  }

  unicodeToChar(text) {
    return text.replace(/\\u[\dA-F]{4}/gi, 
           function (match) {
                return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
           });
 }

  scan_shop() {
    // this.retrieveShopGI('tmshop', '星屿地球仪旗舰店', '57302185'); 
    // return;

    /*
    let barOptions = {
    };
    */

    this.barcodeScanner.scan().then((barcodeData) => {
      this.search_shop_internal(barcodeData.text);
    }, (err) => {
      // An error occurred
      alert(`扫描有错：${err}`);
    });
  }

  delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
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
