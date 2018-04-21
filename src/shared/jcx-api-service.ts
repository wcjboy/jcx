import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

@Injectable()

export class JcxApi {
    public static baseUrl = 'http://jichengxin.com';
    // public static baseUrl = 'http://192.168.1.88:8080';
    // public static baseUrl = 'http://192.168.43.149:8080';
    options: RequestOptions;
    optionsTb: RequestOptions;
    constructor(private http: Http) {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' });
        this.options = new RequestOptions({ headers: headers, withCredentials: true });
        this.optionsTb = new RequestOptions({ headers: headers});
    }


    //  how to use http.post to send form data in Ionic
    //	http://stackoverflow.com/questions/19254029/angularjs-http-post-does-not-send-data
    //  change n=v&n=v to represent json object
    param(obj) {
        let query = '', name, value, fullSubName, subName, subValue, innerObj, i;
        for (name in obj) {
            value = obj[name];
            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += this.param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += this.param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // get taobao baobei's web content via get method
    getTaobaoBaobeiPage(url: string) {
        return new Promise((resolve, reject) => {
            this.http.get(url, this.optionsTb
            ).subscribe(res =>
                resolve(res.text()), (error) => {
                    reject(error);
                });
        })
    }

    // logout for current account
    logout(userid_: number) {
        let formObj = {
            isapp: 'true',
            module: 'user'
        };
        let formData = this.param(formObj);
        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/jforum.page`, formData, this.options
            ).subscribe(res => {
                // let tt = [];
                let tt = {
                    "validateStatus": 'Invalid'
                }
                try {
                    tt = res.json();
                } catch (e) {
                    // nothing to do 
                    console.log("Error in json");
                    console.log(e);
                }
                resolve(tt);//resolve(res.json());
            }
                , (error) => {
                    reject(error);
                });
        });
    }

    // send new topic to jforum
    sendNewTopic(forumid_, subject_, message_) {
        let formObj = {
            isapp: 'true',
            action: 'insertSave',
            module: 'posts',
            preview: '0',
            is_wysiwyg: '1',
            OWASP_CSRFTOKEN: '',
            forum_id: forumid_,
            start: '',
            subject: subject_,
            message: message_,
            poll_label: '',
            poll_option: '',
            poll_option_1: '',
            poll_length: 0,
            poll_option_count: 1
        };
        let formData = this.param(formObj);

        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/jforum.page`, formData, this.options
            ).subscribe(res => {
                // let tt = [];
                let tt = {
                    "errorMessage": '有错！'
                }
                try {
                    tt = res.json();
                } catch (e) {
                    // nothing to do 
                    console.log("Error in json");
                    console.log(e);
                }
                resolve(tt);
            }
                , (error) => {
                    // console.log(error);
                    reject(error);
                });
        });
    }    

    // send new post to jforum
    sendNewReply(forumid, topicid, start_, message_) {
        let formObj = {
            isapp: 'true',
            action: 'insertSave',
            module: 'posts',
            is_wysiwyg: '1',
            quick: '1',
            OWASP_CSRFTOKEN: '',
            forum_id: forumid,
            topic_id: topicid,
            start: start_,
            message: message_
        };
        let formData = this.param(formObj);

        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/jforum.page`, formData, this.options
            ).subscribe(res => {
                // let tt = [];
                let tt = {
                    "errorMessage": '有错！'
                }
                try {
                    tt = res.json();
                } catch (e) {
                    // nothing to do 
                    console.log("Error in json");
                    console.log(e);
                }
                resolve(tt);
            }
                , (error) => {
                    // console.log(error);
                    reject(error);
                });
        });
    }

    // login using the username & password
    login(username_: string, password_: string) {
        let formObj = {
            isapp: 'true',
            module: 'user',
            action: 'validateLogin',
            OWASP_CSRFTOKEN: '',
            username: username_,
            password: password_,
            redirect: '',
            autologin: 'on',
            login: '登入'
        };
        let formData = this.param(formObj);

        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/jforum.page`, formData, this.options
            ).subscribe(res => {
                // let tt = [];
                let tt = {
                    "validateStatus": 'Invalid'
                }
                try {
                    tt = res.json();
                } catch (e) {
                    // nothing to do 
                    console.log("Error in json");
                    console.log(e);
                }
                resolve(tt);//resolve(res.json());
            }
                , (error) => {
                    // console.log('Error in Post');
                    // console.log(error);
                    reject(error);
                });
        });
    }

    // get the forum catogary list
    getForumList() {
        // let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        // if (currentUser && currentUser.token) {
        //     let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
        //     return new RequestOptions({ headers: headers });
        // }

        let formObj = { isapp: 'true' };
        let formData = this.param(formObj);

        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/forums/list.page`, formData, this.options
            ).subscribe(res =>
                resolve(res.json()), (error) => {
                    // console.log('Error in Post');
                    // console.log(error);
                    reject(error);
                });
        });
    }

    // get the topic list in one forum
    getTopicsInForum(forumId: Number, start: Number) {
        let formObj = { isapp: 'true' };
        let formData = this.param(formObj);

        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/forums/show/${start}/${forumId}.page`, formData, this.options
            ).subscribe(res => {
                // let tt = [];
                let tt = {
                    "topics": [],
                    "recordsPerPage": 20,
                    "thisPage": 0,
                    "totalPages": 0,
                    "forumId": forumId
                }
                try {
                    tt = res.json();
                } catch (e) {
                    // nothing to do 
                    console.log("Error in json");
                    console.log(e);
                }
                resolve(tt);//resolve(res.json());
            }
                , (error) => {
                    reject(error);
                });
        });
    }

    // get the post list in one topic
    getPostsInTopic(topicId: Number, start: Number, postId: Number) {
        let formObj = { isapp: 'true' };
        let formData = this.param(formObj);

        let url_;
        if (postId != null) {
            url_ = JcxApi.baseUrl + '/posts/preList/' + topicId + '/' + postId + '.page';
        } else {
            url_ = JcxApi.baseUrl + '/posts/list/' + start + '/' + topicId + '.page';
        }

        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/posts/list/${start}/${topicId}.page`, formData, this.options
            ).subscribe(res => {
                let tt = [];
                try {
                    tt = res.json();
                } catch (e) {
                    // nothing to do 
                    console.log("Error in json");
                    console.log(e);
                }
                resolve(tt);//resolve(res.json());
            }
                , (error) => {
                    reject(error);
                });
        });
    }

    // this method is also ok.
    getMobileHomeData() {
        let formObj = {};
        let formData = this.param(formObj);
        // let bodyString = JSON.stringify({}); // Stringify payload
        // let headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' }); // ... Set content type to JSON
        // let options = new RequestOptions({ headers: headers, withCredentials: true }); // Create a request option

        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/mobile/ajaxloadAllInOneJcx.do`, formData, this.options
            ).subscribe(res =>
                resolve(res.json()), (error) => {
                    reject(error);
                });
        })
    }

    // origin : "03/10/2016 22:45:46"
    // convert : 10-03 22:45
    getShortTimeFormat(origin: string): string {
        if (origin != null) {
            return origin.substr(5, 2) + '-' + origin.substr(8, 2) + origin.substr(10, 6);
        } else {
            return "";
        }
    }


    // new shop search
    newShopSearch(query_keywords: string, query_shoptype: string, query_shoparea: string,
        query_scope: string, query_result_sort: string) {
        let formObj = {
            query_keywords: query_keywords,
            query_shoptype: query_shoptype,
            query_shoparea: query_shoparea,
            query_scope: query_scope,
            query_result_sort: query_result_sort,
            query_type: 'search'
        };
        let formData = this.param(formObj);
        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/mobile/ajaxqueryShops.do`, formData, this.options
            ).subscribe(res => {
                // let tt = [];
                let tt = {
                    "validateStatus": 'Invalid'
                }
                try {
                    tt = res.json();
                } catch (e) {
                    // nothing to do 
                    console.log("Error in json");
                    console.log(e);
                }
                resolve(tt);
            }
                , (error) => {
                    reject(error);
                });
        });
    }

    // previous search result
    previousShopSearchPage() {
        let formObj = {};
        let formData = this.param(formObj);
        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/mobile/ajaxloadPrevSearch.do`, formData, this.options
            ).subscribe(res => {
                // let tt = [];
                let tt = {
                    "validateStatus": 'Invalid'
                }
                try {
                    tt = res.json();
                } catch (e) {
                    // nothing to do 
                    console.log("Error in json");
                    console.log(e);
                }
                resolve(tt);
            }
                , (error) => {
                    reject(error);
                });
        });
    }

    // next search result
    nextShopSearchPage() {
        let formObj = {};
        let formData = this.param(formObj);
        return new Promise((resolve, reject) => {
            this.http.post(`${JcxApi.baseUrl}/mobile/ajaxloadNextSearch.do`, formData, this.options
            ).subscribe(res => {
                // let tt = [];
                let tt = {
                    "validateStatus": 'Invalid'
                }
                try {
                    tt = res.json();
                } catch (e) {
                    // nothing to do 
                    console.log("Error in json");
                    console.log(e);
                }
                resolve(tt);
            }
                , (error) => {
                    reject(error);
                });
        });
    }


}