import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

import { PostsListPage, JcxMePage} from "../../pages"
import { JcxApi, UserSettings} from '../../../shared/shared';


declare var nicEditor: any;
declare var nicEditors: any;
declare var bkLib: any;
declare var jQuery: any;

@Component({
  selector: 'page-shop-gi',
  templateUrl: 'shop-gi.html'
})
export class ShopGiPage {
    baseUrl: string;
    nicEditorDisplay: string = "none";

    shopId: string = null;
    shopType: string = null;
    shopName: string = null;

    one: any = null;
    shop: any = null;

    shopTopic: any = null;


    // local variable for jQuery
    jq: any;

    constructor(public navCtrl: NavController, private navParams: NavParams, private jcxApi: JcxApi
      , private loadingController: LoadingController, private userSettings: UserSettings) {
        this.one = navParams.data;
        if(this.one.tbshop != null) {
            this.shopId = this.one.tbshop.shopId;
            this.shopName = this.one.tbshop.shopName;
            this.shopType = 'tbshop';
            this.shop = this.one.tbshop;
        }else if(this.one.tmshop != null) {
            this.shopId = this.one.tmshop.shopId;
            this.shopName = this.one.tmshop.shopName;
            this.shopType = 'tmshop';
            this.shop = this.one.tmshop;
        }
        
        this.baseUrl = JcxApi.baseUrl;
        this.shopTopic = {};
        this.jq = jQuery;
    }

    loadShopGI() { 
        let shop = this.shop;
        var $ = jQuery;
        //$('#forumPostsForThisShop').attr("onclick", ddd );
        //$('#shopOwnerBBS').attr("onclick",  bbslink);
          
        this.shopTopic.id = Number(shop.attrs.forumTopicNum);
        this.shopTopic.title = '"' + this.shopName + '"';
        console.log('loadShopGI enter!')
        
        var jcxtmp = shop.jcx;        
        var shopDefLogo = JcxApi.baseUrl + '/images/ty-logo.png';
        var shopLink = "";
        switch(this.shopType) {
          case  'tbshop' :
          case 'tmshop' :
            shopLink = "http://shop.m.taobao.com/shop/shopIndex.htm?shop_id=" + shop.shopId; break;
        }
        
        $("#tm_shopName_1").attr("href", shopLink);
        $("#tm_shopName_2").attr("href", shopLink);
        
        var shopname = $('<div/>').html(shop.shopName).text();
        
        $("#shopName").text(shopname); 
        
        $("#tm_shopimg").attr("src", shop.attrs.shopImgLink == null ? shopDefLogo : this.userSettings.convertImgSrc(shop.attrs.shopImgLink));
        // sale & num for products
        if(jcxtmp < 0) {
          $("#tm_info_sale").text('--');
          $("#tm_info_sum").text('--');	
        }else {
          $("#tm_info_sale").text(shop.bbSale);
          $("#tm_info_sum").text(shop.bbSum);	
        }
        
        var maincat = shop.mainCat;
        //maincat = maincat.replace(/target="_blank"/g, "");
        //maincat = maincat.replace(/\/tbshop\/querykeyFromLink.do/g, "page-ns-search.html");
        maincat = maincat.replace(/<\/a>/g, "");
        maincat = maincat.replace(/<a[^>]*>/g, "");
        $("#tm_main_cat").html(maincat);
        var height = $("#tm_main_cat").height();
        if(height > 80) {
          $("#tm_main_cat").height(80);
          $("#tm_main_cat").after( '<a id="moreinfo" href="#" onclick="' + "jQuery('#tm_main_cat').height('auto'); jQuery('#moreinfo').remove(); return false;" + '" >»更多标签</a>' );
        }
        
        switch(this.shopType) {
          case  'tbshop' :
          case 'tmshop' :
            $("#tm_seller").text(shop.nickName);
            $("#tm_area").text(shop.area);
            $("#tm_service").text(shop.service);
            $("#tm_service_div").show();
            if(shop.shopAlias != undefined && shop.shopAlias != null) {
              $("#tm_shopalias").text(shop.shopAlias);
              $("#tm_shopalias_div").show();
            }
            // 4 products window
            $("#tm_pHref_0").attr("href", this.userSettings.convertImgSrc(shop.attrs.pImg0));
            $("#tm_pImg_0").attr("src", this.userSettings.convertImgSrc(shop.attrs.pImg0));
            $("#tm_pHref_1").attr("href", this.userSettings.convertImgSrc(shop.attrs.pImg1));
            $("#tm_pHref_2").attr("href", this.userSettings.convertImgSrc(shop.attrs.pImg2));
            $("#tm_pHref_3").attr("href", this.userSettings.convertImgSrc(shop.attrs.pImg3));
            // 店铺动态数据
            $("#tm_mas").text(shop.mas);
            $("#tm_sas").text(shop.sas);
            $("#tm_cas").text(shop.cas);
            if(shop.mg >=0 ) {
              $("#tm_mg").text('高于 ' + shop.mg + '%');
              $("#tm_mg").attr("class","higherThanPeer");
            }else {
              $("#tm_mg").text('低于 ' + (-shop.mg) + '%');
              $("#tm_mg").attr("class","lowerThanPeer");
            }
            if(shop.sg >=0 ) {
              $("#tm_sg").text('高于 ' + shop.sg + '%');
              $("#tm_sg").attr("class","higherThanPeer");
            }else {
              $("#tm_sg").text('低于 ' + (-shop.sg) + '%');
              $("#tm_sg").attr("class","lowerThanPeer");
            }
            if(shop.cg >=0 ) {
              $("#tm_cg").text('高于 ' + shop.cg + '%');
              $("#tm_cg").attr("class","higherThanPeer");
            }else {
              $("#tm_cg").text('低于 ' + (-shop.cg) + '%');
              $("#tm_cg").attr("class","lowerThanPeer");
            }
            
            if(this.one.sgi.currentServicePos > 0) {
              $("#tm_service_rank_div").show();
              $("#gi-p-stat-jcx-current-service").html( "“" + shop.service +  "”类 第#" + this.one.sgi.currentServicePos + "/共" + this.one.sgi.currentServiceTotalShops);
            }
            if(this.one.sgi.currentRatingPos > 0) {
              $("#tm_rating_rank_div").show();
              $("#gi-p-stat-jcx-current-rating").html( '“' + shop.service +  "”类 第#" + this.one.sgi.currentRatingPos + "/共" + this.one.sgi.currentRatingTotalShops);
            }
            break;
        }
        
        if(jcxtmp < 0) {
          $("#gi-p-stat-jcx").text('--');
          $("#shopTrackCurves").hide();
        } else {
          var strack = this.one.strack;
          //line-chart part
          //calculateJcxInShop(shop);
          $("#flot-line-chart-head-0").text("商品销量");
          $("#flot-line-chart-head-1").text("商品数量");
          $("#flot-line-chart-head-2").text("卖家信誉");
          $("#flot-line-chart-head-3").text("描述相符");
          $("#flot-line-chart-head-4").text("服务态度");
          $("#flot-line-chart-head-5").text("发货速度");
          $("#flot-line-chart-head-6").text("集诚信分");
          var stData = {
              isnull: false,
              bbSale: [],
              bbSum: [],
              srn: [],
              mas: [],
              sas: [],
              cas: [],
              jcx: []
          };
          /*
          if(checkStrackNonEmpty(strack)) {
            var remove = new Array();
            stData.bbSale = removeSingularPointForBbsale(strack.bbSale, remove);			
            stData.bbSum = removeSingularPointForBbsum(strack.bbSum);
            stData.srn = removeSingularPointForSrn(strack.srn, remove);
            stData.mas = removeSingularPointForDynamicPoints(strack.mas, remove);
            stData.sas = removeSingularPointForDynamicPoints(strack.sas, remove);
            stData.cas = removeSingularPointForDynamicPoints(strack.cas, remove);
            
            if(remove.length > 0) {
              stData.jcx = removeSingularPointForJcx(strack.jcx, remove);
            } else {
              stData.jcx = parseShopTrackString(strack.jcx);	
            }
          } else {
            stData.isnull = true;
            var cur = new Date().getTime();
            if(shop != undefined && shop != null) {							
              switch(shoptype) {
              case  'tbshop' :
              case 'tmshop' :
                stData.bbSale.push([cur, shop.bbSale]);
                stData.bbSum.push([cur, shop.bbSum]);
                stData.srn.push([cur, shop.srn]);
                stData.mas.push([cur, shop.mas]);
                stData.sas.push([cur, shop.sas]);
                stData.cas.push([cur, shop.cas]);
                stData.jcx.push([cur, jcxtmp]);
                break;
              }							
            }
          }			
          plotShopTrack(stData);
          */
          $("#gi-p-stat-jcx").html(this.checkJcxPosition(jcxtmp.toFixed(2), this.one.sgi.curPos, this.one.sgi.prePos));
        }
        
        $("#gi-p-stat-rating").html(this.display5star(this.one.sgi.ss.totalShopScore, this.one.sgi.ss.totalScoreNum));
        $("#gi-p-stat-totalscorenum").text(this.one.sgi.ss.totalScoreNum);
        if(this.one.sgi.ss.totalScoreNum > 0) {
          $("#g_score5_num").text(this.one.sgi.numOfScore5);
          $("#g_score5_fill").width(Math.round(100*this.one.sgi.numOfScore5/this.one.sgi.ss.totalScoreNum) + "%");
          $("#g_score4_num").text(this.one.sgi.numOfScore4);
          $("#g_score4_fill").width(Math.round(100*this.one.sgi.numOfScore4/this.one.sgi.ss.totalScoreNum) + "%");
          $("#g_score3_num").text(this.one.sgi.numOfScore3);
          $("#g_score3_fill").width(Math.round(100*this.one.sgi.numOfScore3/this.one.sgi.ss.totalScoreNum) + "%");
          $("#g_score2_num").text(this.one.sgi.numOfScore2);
          $("#g_score2_fill").width(Math.round(100*this.one.sgi.numOfScore2/this.one.sgi.ss.totalScoreNum) + "%");
          $("#g_score1_num").text(this.one.sgi.numOfScore1);
          $("#g_score1_fill").width(Math.round(100*this.one.sgi.numOfScore1/this.one.sgi.ss.totalScoreNum) + "%");
  
          $("#jcxratings_chart").show();
        }
        $("#gi-p-stat-recommend").text(this.one.sgi.ss.recommendNum);
        if(this.one.sgi.shopKb != null || this.one.sgi.shopKb != undefined) {
          $("#gi-p-stat-koubei").text(this.one.sgi.shopKb.koubei);
        }
        $("#num-000").text(this.one.sgi.ss.recommendNum);

        switch (this.one.sgi.sau.recommend) {
          case -1: $("#gi-p-000").removeClass("checkbox-three-checked"); break;
          case 1: $("#gi-p-000").addClass("checkbox-three-checked"); break;
          default: $("#gi-p-000").removeClass("checkbox-three-checked");
        }
        
        if(this.one.sgi.sau.shopScore < 800) {
          $('#rangeInput').rating('update', this.one.sgi.sau.shopScore);
          $("#shopAllCommentsSubmit").text("更改");
        } else {
          $("#rangeInput").val(0); // 888 对应 '未评分'--0
        }
        
        this.updateFeedbackNumbers(this.one.sgi.ss.feedbacks);
        
        if(this.one.sgi.sau.feedback != undefined)  {
          //			优点：100
          //			101 产品质量好，描述真实
          this.one.sgi.sau.feedback.indexOf("101") < 0 ?  $("#gi-p-101").removeClass("checkbox-three-checked") :   $("#gi-p-101").addClass("checkbox-three-checked");
          //			102 品牌真实，无假冒
          this.one.sgi.sau.feedback.indexOf("102") < 0 ?  $("#gi-p-102").removeClass("checkbox-three-checked") :   $("#gi-p-102").addClass("checkbox-three-checked");
          //			103 产品性价比高，质优价廉
          this.one.sgi.sau.feedback.indexOf("103") < 0 ?  $("#gi-p-103").removeClass("checkbox-three-checked") :   $("#gi-p-103").addClass("checkbox-three-checked");
          //			104 服务态度一流
          this.one.sgi.sau.feedback.indexOf("104") < 0 ?  $("#gi-p-104").removeClass("checkbox-three-checked") :   $("#gi-p-104").addClass("checkbox-three-checked");
          //			105 其产品/服务为独创
          this.one.sgi.sau.feedback.indexOf("105") < 0 ?  $("#gi-p-105").removeClass("checkbox-three-checked") :   $("#gi-p-105").addClass("checkbox-three-checked");
          //			106 其产品为优质地方特产
          this.one.sgi.sau.feedback.indexOf("106") < 0 ?  $("#gi-p-106").removeClass("checkbox-three-checked") :   $("#gi-p-106").addClass("checkbox-three-checked");
          //			107物流速度快
          this.one.sgi.sau.feedback.indexOf("107") < 0 ?  $("#gi-p-107").removeClass("checkbox-three-checked") :   $("#gi-p-107").addClass("checkbox-three-checked");
          //			108 价格便宜，但质量一般
          this.one.sgi.sau.feedback.indexOf("108") < 0 ?  $("#gi-p-108").removeClass("checkbox-three-checked") :   $("#gi-p-108").addClass("checkbox-three-checked");
          //			109 商品设计得好、外观好、版型剪裁好
          this.one.sgi.sau.feedback.indexOf("109") < 0 ?  $("#gi-p-109").removeClass("checkbox-three-checked") :   $("#gi-p-109").addClass("checkbox-three-checked");
          //		缺点：200
          //			201 产品描述有虚假成分，货品与图片不一致
          this.one.sgi.sau.feedback.indexOf("201") < 0 ?  $("#gi-p-201").removeClass("checkbox-three-checked") :   $("#gi-p-201").addClass("checkbox-three-checked");
          //			202 曾经买到过假货
          this.one.sgi.sau.feedback.indexOf("202") < 0 ?  $("#gi-p-202").removeClass("checkbox-three-checked") :   $("#gi-p-202").addClass("checkbox-three-checked");
          //			203 服务态度恶劣
          this.one.sgi.sau.feedback.indexOf("203") < 0 ?  $("#gi-p-203").removeClass("checkbox-three-checked") :   $("#gi-p-203").addClass("checkbox-three-checked");
          //			204 与该店有未解决纠纷
          this.one.sgi.sau.feedback.indexOf("204") < 0 ?  $("#gi-p-204").removeClass("checkbox-three-checked") :   $("#gi-p-204").addClass("checkbox-three-checked");
          //			205 商品价格偏贵
          this.one.sgi.sau.feedback.indexOf("205") < 0 ?  $("#gi-p-205").removeClass("checkbox-three-checked") :   $("#gi-p-205").addClass("checkbox-three-checked");
          //			206 售后服务反应慢、低效，态度不好
          this.one.sgi.sau.feedback.indexOf("206") < 0 ?  $("#gi-p-206").removeClass("checkbox-three-checked") :   $("#gi-p-206").addClass("checkbox-three-checked");
          //			207 发货、物流慢
          this.one.sgi.sau.feedback.indexOf("207") < 0 ?  $("#gi-p-207").removeClass("checkbox-three-checked") :   $("#gi-p-207").addClass("checkbox-three-checked");
          //			208 商品质量不好，不满意
          this.one.sgi.sau.feedback.indexOf("208") < 0 ?  $("#gi-p-208").removeClass("checkbox-three-checked") :   $("#gi-p-208").addClass("checkbox-three-checked");
          //			209 商品不耐用，做工不好
          this.one.sgi.sau.feedback.indexOf("209") < 0 ?  $("#gi-p-209").removeClass("checkbox-three-checked") :   $("#gi-p-209").addClass("checkbox-three-checked");
          //		消费者情况：300
          //			301 是该店的新客户，还会再买
          this.one.sgi.sau.feedback.indexOf("301") < 0 ?  $("#gi-p-301").removeClass("checkbox-three-checked") :   $("#gi-p-301").addClass("checkbox-three-checked");
          //			302 曾经是该店客户，不会再买
          this.one.sgi.sau.feedback.indexOf("302") < 0 ?  $("#gi-p-302").removeClass("checkbox-three-checked") :   $("#gi-p-302").addClass("checkbox-three-checked");
          //			303 不是该店客户
          this.one.sgi.sau.feedback.indexOf("303") < 0 ?  $("#gi-p-303").removeClass("checkbox-three-checked") :   $("#gi-p-303").addClass("checkbox-three-checked");
          //			304 是该店忠实客户，已经买过多次
          this.one.sgi.sau.feedback.indexOf("304") < 0 ?  $("#gi-p-304").removeClass("checkbox-three-checked") :   $("#gi-p-304").addClass("checkbox-three-checked");
        }
    }		

    /*
    * produce the position info for jcx scores
    */
    checkJcxPosition(jcx, curPos, prePos) {
      var ret = jcx + '(' + curPos;
      
      var p = prePos - curPos;
      var minusP = -p;
      if(p > 0) {
        ret += '<span class="list-top-up" ><i class="fa fa-long-arrow-up"></i>' + p + '</span>';
      } else if (p < 0) {
        ret += '<span class="list-top-down" ><i class="fa fa-long-arrow-down"></i>' + minusP + '</span>';
      } else {
        ret += '<span class="list-top-flat" ><i class="fa fa-minus"></i></span>';
      }
      
      ret += ')';

      return ret;
    }

    checkCommentUserList(shopid: string, shoptype: string) {
			var $ = jQuery;
			var shopid_ = shopid;
			var shoptype_ = shoptype;
			
			function successListener ( one, textStatus) {
				var startstr = 'Success:';
				if(one.startsWith(startstr)) {													
					alert(one.substring(startstr.length));
				}else {
					alert(one);
				}
			}
			function errorListener (xhr,status,error) {
				alert(status);
			}
			// JQuery ajax post method
			var url_ = JcxApi.baseUrl + '/checkCommentUserList.do';
			
			$.ajax({
				  type: "POST",
				  url: url_,
				  contentType: "application/x-www-form-urlencoded; charset=utf-8",
				  success: successListener,
				  error: errorListener,
				  dataType: 'text',
				  data: {
					  shopid: shopid_,
					  shoptype: shoptype_
				  }
				});
			return false;
    }
    

    /*
		* send shop feedbacks 
		*/
		sendShopAllComments(shopid, shoptype_) {
			var $ = jQuery;
			if(this.userSettings.user == null) {
				alert("您好，请先登录再评价，谢谢。");
				return false;
			}

			var score_ = $('#rangeInput').val() == 0 ? 888 : $('#rangeInput').val();
			var recommend_ = 'false';
			if($("#gi-p-000").hasClass("checkbox-three-checked")) { recommend_ = 'true'; }
			
			var feedback_ = '';			
			if($("#gi-p-101").hasClass("checkbox-three-checked")) { feedback_ += '101;'; }
			if($("#gi-p-102").hasClass("checkbox-three-checked")) { feedback_ += '102;'; }
			if($("#gi-p-103").hasClass("checkbox-three-checked")) { feedback_ += '103;'; }
			if($("#gi-p-104").hasClass("checkbox-three-checked")) { feedback_ += '104;'; }
			if($("#gi-p-105").hasClass("checkbox-three-checked")) { feedback_ += '105;'; }
			if($("#gi-p-106").hasClass("checkbox-three-checked")) { feedback_ += '106;'; }
			if($("#gi-p-107").hasClass("checkbox-three-checked")) { feedback_ += '107;'; }
			if($("#gi-p-108").hasClass("checkbox-three-checked")) { feedback_ += '108;'; }
			if($("#gi-p-109").hasClass("checkbox-three-checked")) { feedback_ += '109;'; }
			if($("#gi-p-201").hasClass("checkbox-three-checked")) { feedback_ += '201;'; }
			if($("#gi-p-202").hasClass("checkbox-three-checked")) { feedback_ += '202;'; }
			if($("#gi-p-203").hasClass("checkbox-three-checked")) { feedback_ += '203;'; }
			if($("#gi-p-204").hasClass("checkbox-three-checked")) { feedback_ += '204;'; }
			if($("#gi-p-205").hasClass("checkbox-three-checked")) { feedback_ += '205;'; }
			if($("#gi-p-206").hasClass("checkbox-three-checked")) { feedback_ += '206;'; }
			if($("#gi-p-207").hasClass("checkbox-three-checked")) { feedback_ += '207;'; }
			if($("#gi-p-208").hasClass("checkbox-three-checked")) { feedback_ += '208;'; }
			if($("#gi-p-209").hasClass("checkbox-three-checked")) { feedback_ += '209;'; }
			if($("#gi-p-301").hasClass("checkbox-three-checked")) { feedback_ += '301;'; }
			if($("#gi-p-302").hasClass("checkbox-three-checked")) { feedback_ += '302;'; }
			if($("#gi-p-303").hasClass("checkbox-three-checked")) { feedback_ += '303;'; }
			if($("#gi-p-304").hasClass("checkbox-three-checked")) { feedback_ += '304;'; }	
			
      console.log(shopid + " " + shoptype_);
      console.log(recommend_ + " " + score_);
      console.log(feedback_);
			var oldButtonText = $('#shopAllCommentsSubmit').text();
			$('#shopAllCommentsSubmit').text(oldButtonText + "……");

      // send all comments
      this.jcxApi.sendShopAllComments(shopid, shoptype_, recommend_, score_,
        feedback_).then(data => {
          console.log(data);
          let ss: any = data;
          if(ss.feedbacks === undefined || ss.feedbacks === null) {
            alert("如已登录，则店铺评分不能为空，或者该店铺ID不合法。如未登录，请登录，再提交或更改！");
            $('#shopAllCommentsSubmit').text(oldButtonText);
          } else {
            this.updateFeedbackNumbers(ss.feedbacks);
            $("#gi-p-stat-rating").html(this.display5star(ss.totalShopScore, ss.totalScoreNum));
            $("#gi-p-stat-totalscorenum").text(ss.totalScoreNum);
            $("#gi-p-stat-recommend").text(ss.recommendNum);
            $("#num-000").text(ss.recommendNum);		
  
            alert("您好，您的评价提交成功，");
            $('#shopAllCommentsSubmit').text("更改");
          }	
      }).catch((e) => {
        console.log(e);
        alert("您好，您的评价提交失败，请重新尝试，谢谢。");
				$('#shopAllCommentsSubmit').text(oldButtonText);
      });
			return false;
    };

    display5star(totalscore, num) {	
      var RATINGEMPTY = '<span class="ratingempty" ><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i><i class="fa fa-star-o"></i></span>';
      var fa_star_o = '<i class="fa fa-star-o"></i>';
      var fa_star = '<i class="fa fa-star"></i>';
      var fa_star_half_o = '<i class="fa fa-star-half-o"></i>';

      var score;
      if(num == 0 || undefined == num) {
        return RATINGEMPTY;
      } else {
        score = totalscore/num;
      }
      var text = '';
      var color = "#ddd";
      if (score < 1.5) {
        color = "#d9534f"; // - label-danger
      } else if (score < 2.5) {
        color = "#f0ad4e";  // - label-warning
      } else if (score < 3.5) {
        color = "#5bc0de"; // - label-info
      } else if (score < 4.5) {
        color = "#337ab7"; // - label-primary
      } else if (score <= 5.0) {
        color = "#00FF00"; // #5cb85c - label-success
      }
      text += '<span style="color:' + color + ';font-size: 19px;" >'; 
      for (var i = 0; i < 5; i++) {
        if (score >= i + 1) {
          text += fa_star;
        } else if (score >= i + 0.5) {
          text += fa_star_half_o;
        } else {
          text += fa_star_o;
        }
      }
      text += '(' + score.toFixed(1) + ')' + '</span>';
    
      return text;
    }
    
    updateFeedbackNumbers(feedbacks) {
			var $ = jQuery;
			
			if(feedbacks != undefined)  {
				//var myRegEx = /101\((\d+)\)/g;
				//		优点：100
				this.getFeedbackMatch('#num-101', '#gi-p-101', feedbacks, /101\((\d+)\);/g); //$('#num-101').text(getFeedbackMatch(feedbacks, /101\((\d+)\);/g));
				this.getFeedbackMatch('#num-102', '#gi-p-102', feedbacks, /102\((\d+)\);/g);
				this.getFeedbackMatch('#num-103', '#gi-p-103', feedbacks, /103\((\d+)\);/g);
				this.getFeedbackMatch('#num-104', '#gi-p-104', feedbacks, /104\((\d+)\);/g);
				this.getFeedbackMatch('#num-105', '#gi-p-105', feedbacks, /105\((\d+)\);/g);
				this.getFeedbackMatch('#num-106', '#gi-p-106', feedbacks, /106\((\d+)\);/g);
				this.getFeedbackMatch('#num-107', '#gi-p-107', feedbacks, /107\((\d+)\);/g);
				this.getFeedbackMatch('#num-108', '#gi-p-108', feedbacks, /108\((\d+)\);/g);
				this.getFeedbackMatch('#num-109', '#gi-p-109', feedbacks, /109\((\d+)\);/g);

				//		缺点：200
				this.getFeedbackMatch('#num-201', '#gi-p-201', feedbacks, /201\((\d+)\);/g); //$('#num-201').text(getFeedbackMatch(feedbacks, /201\((\d+)\);/g));
				this.getFeedbackMatch('#num-202', '#gi-p-202', feedbacks, /202\((\d+)\);/g);
				this.getFeedbackMatch('#num-203', '#gi-p-203', feedbacks, /203\((\d+)\);/g);
				this.getFeedbackMatch('#num-204', '#gi-p-204', feedbacks, /204\((\d+)\);/g);
				this.getFeedbackMatch('#num-205', '#gi-p-205', feedbacks, /205\((\d+)\);/g);
				this.getFeedbackMatch('#num-206', '#gi-p-206', feedbacks, /206\((\d+)\);/g);
				this.getFeedbackMatch('#num-207', '#gi-p-207', feedbacks, /207\((\d+)\);/g);
				this.getFeedbackMatch('#num-208', '#gi-p-208', feedbacks, /208\((\d+)\);/g);
				this.getFeedbackMatch('#num-209', '#gi-p-209', feedbacks, /209\((\d+)\);/g);

				//		消费者情况：300
				this.getFeedbackMatch('#num-301', '#gi-p-301', feedbacks, /301\((\d+)\);/g); //$('#num-301').text(getFeedbackMatch(feedbacks, /301\((\d+)\);/g));
				this.getFeedbackMatch('#num-302', '#gi-p-302', feedbacks, /302\((\d+)\);/g);
				this.getFeedbackMatch('#num-303', '#gi-p-303', feedbacks, /303\((\d+)\);/g);
				this.getFeedbackMatch('#num-304', '#gi-p-304', feedbacks, /304\((\d+)\);/g);
			}
    }
    
    getFeedbackMatch(numId, labelId, string, regex) {
			var $ = jQuery;
			var match = regex.exec(string);
			if(match == null) {
			 $(numId).text('0');
			 // return '0';
			} else {
			 var num = match[1];
			 $(numId).text(num);
			 if(num != '0') {
			  $(labelId).css("font-weight", "bold");
			 }		 
			 // return match[1];
			}
    }
    
    // open shop topic
    openShopTopic() {
      console.log(this.shopTopic.id);
      this.navCtrl.push(PostsListPage, this.shopTopic);
    }

    // toggle user comments
    toggleUserComments() {
      if( this.jq("#collapseHead").hasClass("collapsed")) {
        // remove 'collapsed' class
        this.jq("#collapseHead").removeClass("collapsed");
        this.jq("#collapseBody").addClass("in");
      }else {
        // add 'collapsed' class
        this.jq("#collapseHead").addClass("collapsed");
        this.jq("#collapseBody").removeClass("in");
      }
      return false;
    }


    /*Runs when the page is about to enter and become the active page.*/
    ionViewWillEnter() {
    }

    /*Runs when the page has loaded. This event only happens once per page being created.
    If a page leaves but is cached, then this event will not fire again on a subsequent viewing.
    The ionViewDidLoad event is good place to put your setup code for the page.
    */
  ionViewDidLoad() {
    console.log('ionViewDidLoad--shop-gi');
    /*
    new nicEditor({
      buttonList: ['bold', 'italic', 'underline', 'image', 'upload', 'emoji'],
      uploadURI: this.baseUrl + '/uploadNiceFile.do',
      baseUrl: this.baseUrl
    }).panelInstance('niceShopTextArea');
    */

   var $ = jQuery;

   $('#tooltip1').click(function(){
     $('#tooltip2text').hide();
     $('#tooltip3text').hide();
       $('#tooltip1text').toggle();
     });
   $('#tooltip2').click(function(){
     $('#tooltip1text').hide();
     $('#tooltip3text').hide();
       $('#tooltip2text').toggle();
     });
   $('#tooltip3').click(function(){
     $('#tooltip1text').hide();
     $('#tooltip2text').hide();
       $('#tooltip3text').toggle();
     });

   if(this.shop == null) {
     alert("没有店铺ID，请检查再试。");
     return;
   }

   $('.checkbox-one').click(function() {
      $(this).toggleClass('checkbox-one-checked');
      return false;
    });
    $('.checkbox-two').click(function() {
      $(this).toggleClass('checkbox-two-checked');
      return false;
    });
    $('.checkbox-three').click(function() {
      $(this).toggleClass('checkbox-three-checked');
      return false;
    });	

   this.loadShopGI();
  }

}