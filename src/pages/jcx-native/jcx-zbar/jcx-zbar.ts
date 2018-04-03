import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ZBar } from '@ionic-native/zbar';

// https://github.com/tjwoon/csZBar/blob/master/README.md
// http://ionicframework.com/docs/v2/native/zbar/


@Component({
  selector: 'page-jcx-zbar',
  templateUrl: 'jcx-zbar.html'
})
export class JcxZbarPage {

  results: any;

  constructor(public navCtrl: NavController, private zbar: ZBar) { }

  ionViewDidLoad() {
    console.log('Hello JcxZbarPage Page');
  }

/*
{
    text_title: "OPTIONAL Title Text - default = 'Scan QR Code'", // Android only
    text_instructions: "OPTIONAL Instruction Text - default = 'Please point your camera at the QR code.'", // Android only
    camera: "front" || "back" // defaults to "back"
    flash: "on" || "off" || "auto" // defaults to "auto". See Quirks
    drawSight: true || false //defaults to true, create a red sight/line in the center of the scanner view.
}

*/

  scan() {
    let zBarOptions = {
      flash: "off",
      drawSight: true
    };
    this.zbar.scan(zBarOptions).then((data) => {
      console.log(data);
      this.results = data;
    }, (err) => {
      // An error occurred
      alert(`扫描有错：${err}`);
    });
  }

  reset() {
    this.results = null;
  }

}
