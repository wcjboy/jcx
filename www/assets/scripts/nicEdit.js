/* NicEdit - Micro Inline WYSIWYG
 * Copyright 2007-2008 Brian Kirchoff
 *
 * NicEdit is distributed under the terms of the MIT license
 * For more information visit http://nicedit.com/
 * Do not remove this copyright message
 */


// TODO:  document.execCommand(cmd,false,args);
// TODO:  checkNodes, activate, deactivate, caret color
// DONE:  insertImage  -- check whether the editable area is selected or not
// TODO: can't enter text in input type 'text', focus ?

var neUserListMapObj = {};

// var userlistArr = new Array();

// create the nodeType constants if the Node object is not defined
if (!window.Node){
  var Node =
      {
        ELEMENT_NODE                :  1,
        ATTRIBUTE_NODE              :  2,
        TEXT_NODE                   :  3,
        CDATA_SECTION_NODE          :  4,
        ENTITY_REFERENCE_NODE       :  5,
        ENTITY_NODE                 :  6,
        PROCESSING_INSTRUCTION_NODE :  7,
        COMMENT_NODE                :  8,
        DOCUMENT_NODE               :  9,
        DOCUMENT_TYPE_NODE          : 10,
        DOCUMENT_FRAGMENT_NODE      : 11,
        NOTATION_NODE               : 12
      };
};

// http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
// http://stackoverflow.com/questions/19913171/how-to-trigger-the-html-select-onclick-event-activates-select-dropdown-with-opt	

var bkExtend = function(){
	var args = arguments;
	if (args.length == 1) args = [this, args[0]];
	for (var prop in args[1]) args[0][prop] = args[1][prop];
	return args[0];
};
function bkClass() { }
bkClass.prototype.construct = function() {};
bkClass.extend = function(def) {
  var classDef = function() {
      if (arguments[0] !== bkClass) { return this.construct.apply(this, arguments); }
  };
  var proto = new this(bkClass);
  bkExtend(proto,def);
  classDef.prototype = proto;
  classDef.extend = this.extend;      
  return classDef;
};

var bkElement = bkClass.extend({
	construct : function(elm,d) {
		if(typeof(elm) == "string") {
			elm = (d || document).createElement(elm);
		}
		elm = $BK(elm);
		return elm;
	},
	
	appendTo : function(elm) {
		elm.appendChild(this);	
		return this;
	},
	
	appendBefore : function(elm) {
		elm.parentNode.insertBefore(this,elm);	
		return this;
	},
	
	addEvent : function(type, fn) {
		bkLib.addEvent(this,type,fn);
		return this;	
	},
	
	setContent : function(c) {
		this.innerHTML = c;
		return this;
	},
	
	pos : function() {
		var curleft = curtop = 0;
		var o = obj = this;
		if (obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
			
			/*
			while( obj = obj.offsetParent )  {
				// wcjboy
				var style = window.getComputedStyle(obj);
				var position = style.getPropertyValue('position');
				if( position != 'static') { // static, relative, fixed, absolute
					break;
				}
				
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			}
			*/
		}
		var b = (!window.opera) ? parseInt(this.getStyle('border-width') || this.style.border) || 0 : 0;
		return [curleft+b,curtop+b+this.offsetHeight];
	},	
	
	noSelect : function() {
		bkLib.noSelect(this);
		return this;
	},
	
	parentTag : function(t) {
		var elm = this;
		 do {
			if(elm && elm.nodeName && elm.nodeName.toUpperCase() == t) {
				return elm;
			}
			elm = elm.parentNode;
		} while(elm);
		return false;
	},
	selfTag : function() {
		var elm = this;
		 do {
			if(elm && elm.nodeName && elm.nodeName != '#text') {
				return elm;
			}
			elm = elm.parentNode;
		} while(elm);
		return false;
	},	
	hasClass : function(cls) {
		return this.className.match(new RegExp('(\\s|^)nicEdit-'+cls+'(\\s|$)'));
	},
	
	addClass : function(cls) {
		if (!this.hasClass(cls)) { this.className += " nicEdit-"+cls };
		return this;
	},
	
	removeClass : function(cls) {
		if (this.hasClass(cls)) {
			this.className = this.className.replace(new RegExp('(\\s|^)nicEdit-'+cls+'(\\s|$)'),' ');
		}
		return this;
	},

	setStyle : function(st) {
		var elmStyle = this.style;
		for(var itm in st) {
			switch(itm) {
				case 'float':
					elmStyle['cssFloat'] = elmStyle['styleFloat'] = st[itm];
					break;
				case 'opacity':
					elmStyle.opacity = st[itm];
					elmStyle.filter = "alpha(opacity=" + Math.round(st[itm]*100) + ")"; 
					break;
				case 'className':
					this.className = st[itm];
					break;
				default:
					//if(document.compatMode || itm != "cursor") { // Nasty Workaround for IE 5.5
						elmStyle[itm] = st[itm];
					//}		
			}
		}
		return this;
	},
	
	getStyle : function( cssRule, d ) {
		var doc = (!d) ? document.defaultView : d; 
		if(this.nodeType == Node.ELEMENT_NODE) //Node.ELEMENT_NODE = 1
		return (doc && doc.getComputedStyle) ? doc.getComputedStyle( this, null ).getPropertyValue(cssRule) : this.currentStyle[ bkLib.camelize(cssRule) ];
	},
	
	remove : function() {
		this.parentNode.removeChild(this);
		return this;	
	},
	
	setAttributes : function(at) {
		for(var itm in at) {
			this[itm] = at[itm];
		}
		return this;
	}
});


var bkLib = {
	isMSIE : (navigator.appVersion.indexOf("MSIE") != -1),
	
	addEvent : function(obj, type, fn) {
		(obj.addEventListener) ? obj.addEventListener( type, fn, false ) : obj.attachEvent("on"+type, fn);	
	},
	
	toArray : function(iterable) {
		var length = iterable.length, results = new Array(length);
    	while (length--) { results[length] = iterable[length] };
    	return results;	
	},
	
	noSelect : function(element) {
		if(element.setAttribute && element.nodeName.toLowerCase() != 'input' && element.nodeName.toLowerCase() != 'textarea') {
			element.setAttribute('unselectable','on');
		}
		for(var i=0;i<element.childNodes.length;i++) {
			bkLib.noSelect(element.childNodes[i]);
		}
	},
	camelize : function(s) {
		return s.replace(/\-(.)/g, function(m, l){return l.toUpperCase()});
	},
	inArray : function(arr,item) {
	    return (bkLib.search(arr,item) != null);
	},
	search : function(arr,itm) {
		for(var i=0; i < arr.length; i++) {
			if(arr[i] == itm)
				return i;
		}
		return null;	
	},
	cancelEvent : function(e) {
		e = e || window.event;
		if(e.preventDefault && e.stopPropagation) {
			e.preventDefault();
			e.stopPropagation();
		}
		return false;
	},
	domLoad : [],
	domLoaded : function() {
		if (arguments.callee.done) return;
		arguments.callee.done = true;
		for (i = 0;i < bkLib.domLoad.length;i++) bkLib.domLoad[i]();
	},
	onDomLoaded : function(fireThis) {
		this.domLoad.push(fireThis);
		if (document.addEventListener) {
			document.addEventListener("DOMContentLoaded", bkLib.domLoaded, null);
		} else if(bkLib.isMSIE) {
			document.write("<style>.nicEdit-main p { margin: 0; }</style><scr"+"ipt id=__ie_onload defer " + ((location.protocol == "https:") ? "src='javascript:void(0)'" : "src=//0") + "><\/scr"+"ipt>");
			$BK("__ie_onload").onreadystatechange = function() {
			    if (this.readyState == "complete"){bkLib.domLoaded();}
			};
		}
	    window.onload = bkLib.domLoaded;
	}
};

function $BK(elm) {
	if(typeof(elm) == "string") {
		elm = document.getElementById(elm);
	}
	return (elm && !elm.appendTo) ? bkExtend(elm,bkElement.prototype) : elm;
}

var bkEvent = {
	addEvent : function(evType, evFunc) {
		if(evFunc) {
			this.eventList = this.eventList || {};
			this.eventList[evType] = this.eventList[evType] || [];
			this.eventList[evType].push(evFunc);
		}
		return this;
	},
	fireEvent : function() {
		var args = bkLib.toArray(arguments), evType = args.shift();
		//console.log(evType);
		if(this.eventList && this.eventList[evType]) {
			for(var i=0;i<this.eventList[evType].length;i++) {
				this.eventList[evType][i].apply(this,args);
			}
		}
	}	
};

function __(s) {
	return s;
}

Function.prototype.closure = function() {
  var __method = this, args = bkLib.toArray(arguments), obj = args.shift();
  return function() { if(typeof(bkLib) != 'undefined') { return __method.apply(obj,args.concat(bkLib.toArray(arguments))); } };
}
	
Function.prototype.closureListener = function() {
  	var __method = this, args = bkLib.toArray(arguments), object = args.shift(); 
  	return function(e) { 
  	e = e || window.event;
  	if(e.target) { var target = e.target; } else { var target =  e.srcElement };
	  	return __method.apply(object, [e,target].concat(args) ); 
	};
}		


/* START CONFIG 
 * 
 * 'link','unlink','forecolor','bgcolor' is not working currently.
 * 
 * */

var nicEditorConfig = bkClass.extend({
	buttons : {
		'bold' : {name : __('粗体'), command : 'Bold', tags : ['B','STRONG'], css : {'font-weight' : 'bold'}, key : 'b'},
		'italic' : {name : __('斜体'), command : 'Italic', tags : ['EM','I'], css : {'font-style' : 'italic'}, key : 'i'},
		'underline' : {name : __('下划线'), command : 'Underline', tags : ['U'], css : {'text-decoration' : 'underline'}, key : 'u'},
		'left' : {name : __('Left Align'), command : 'justifyleft', noActive : true},
		'center' : {name : __('Center Align'), command : 'justifycenter', noActive : true},
		'right' : {name : __('Right Align'), command : 'justifyright', noActive : true},
		'justify' : {name : __('Justify Align'), command : 'justifyfull', noActive : true},
		'ol' : {name : __('Insert Ordered List'), command : 'insertorderedlist', tags : ['OL']},
		'ul' : 	{name : __('Insert Unordered List'), command : 'insertunorderedlist', tags : ['UL']},
		'subscript' : {name : __('Click to Subscript'), command : 'subscript', tags : ['SUB']},
		'superscript' : {name : __('Click to Superscript'), command : 'superscript', tags : ['SUP']},
		'strikethrough' : {name : __('Click to Strike Through'), command : 'strikeThrough', css : {'text-decoration' : 'line-through'}},
		'removeformat' : {name : __('Remove Formatting'), command : 'removeformat', noActive : true},
		'indent' : {name : __('Indent Text'), command : 'indent', noActive : true},
		'outdent' : {name : __('Remove Indent'), command : 'outdent', noActive : true},
		'hr' : {name : __('Horizontal Rule'), command : 'insertHorizontalRule', noActive : true}
	},
	iconsPath : 'nice/nicEditorIcons-large-m.png',
	buttonList : ['save','bold','italic','underline','left','center','right','justify','ol','ul','fontSize','fontFamily','fontFormat','indent','outdent','image','upload','link','unlink','forecolor','bgcolor','emoji','uploadvideo','atmoumou'],
	iconList : {"bold":1,"center":2,"hr":3,"indent":4,"italic":5,"justify":6,"left":7,"ol":8,"outdent":9,"removeformat":10,"right":11,"save":22,"strikethrough":13,"subscript":14,"superscript":15,"ul":16,"underline":17,"image":18,"link":19,"unlink":20,"close":21,"upload":23,"emoji":24,"uploadvideo":25,"atmoumou":26}
	
});
/* END CONFIG */


var nicEditors = {
	nicPlugins : [],
	editors : [],
	
	registerPlugin : function(plugin,options) {
		this.nicPlugins.push({p : plugin, o : options});
	},

	allTextAreas : function(nicOptions) {
		var textareas = document.getElementsByTagName("textarea");
		for(var i=0;i<textareas.length;i++) {
			nicEditors.editors.push(new nicEditor(nicOptions).panelInstance(textareas[i]));
		}
		return nicEditors.editors;
	},
	
	findEditor : function(e) {
		var editors = nicEditors.editors;
		for(var i=0;i<editors.length;i++) {
			if(editors[i].instanceById(e)) {
				return editors[i].instanceById(e);
			}
		}
	}
};


var nicEditor = bkClass.extend({
	construct : function(o) {
		this.options = new nicEditorConfig();
		bkExtend(this.options,o);
		this.nicInstances = new Array();
		this.loadedPlugins = new Array();
		
		var plugins = nicEditors.nicPlugins;
		for(var i=0;i<plugins.length;i++) {
			this.loadedPlugins.push(new plugins[i].p(this,plugins[i].o));
		}
		nicEditors.editors.push(this);
		bkLib.addEvent(document.body,'mousedown', this.selectCheck.closureListener(this) );
	},

	panelInstanceId : '',
	
	panelInstance : function(e,o) {
		this.panelInstanceId = e;
		if(typeof this.panelInstanceId === 'string') {
			neUserListMapObj[this.panelInstanceId] = new Array();
		}		
		e = this.checkReplace($BK(e));
		// var panelElm = new bkElement('DIV').setStyle({width : (parseInt(e.getStyle('width')) || e.clientWidth)+'px'}).appendBefore(e);
		var panelElm = new bkElement('DIV').setStyle({width : 'auto' }).appendBefore(e);
		this.setPanel(panelElm);
		return this.addInstance(e,o);	
	},

	checkReplace : function(e) {
		var r = nicEditors.findEditor(e);
		if(r) {
			r.removeInstance(e);
			r.removePanel();
		}
		return e;
	},

	addInstance : function(e,o) {
		e = this.checkReplace($BK(e));
		if( e.contentEditable || !!window.opera ) {
			var newInstance = new nicEditorInstance(e,o,this);
		} else {
			var newInstance = new nicEditorIFrameInstance(e,o,this);
		}
		this.nicInstances.push(newInstance);
		
		//888
		if(this.nicPanel) {
			this.nicPanel.neInstance = newInstance;
		}
		
		return this;
	},
	
	removeInstance : function(e) {
		e = $BK(e);
		var instances = this.nicInstances;
		for(var i=0;i<instances.length;i++) {	
			if(instances[i].e == e) {
				instances[i].remove();
				this.nicInstances.splice(i,1);
			}
		}
	},

	removePanel : function(e) {
		if(this.nicPanel) {
			this.nicPanel.remove();
			this.nicPanel = null;
		}	
	},

	instanceById : function(e) {
		e = $BK(e);
		var instances = this.nicInstances;
		for(var i=0;i<instances.length;i++) {
			if(instances[i].e == e) {
				return instances[i];
			}
		}	
	},

	setPanel : function(e) {
		this.nicPanel = new nicEditorPanel($BK(e),this.options,this);
		this.fireEvent('panel',this.nicPanel);
		return this;
	},
	
	nicCommand : function(cmd,args) {	
		if(this.selectedInstance) {
			this.selectedInstance.nicCommand(cmd,args);
		}
	},
	
	getIcon : function(iconName,options) {
		var icon = this.options.iconList[iconName];
		var file = (options.iconFiles) ? options.iconFiles[iconName] : '';
		return {backgroundImage : "url('"+((icon) ? this.options.iconsPath : file)+"')", backgroundPosition : ((icon) ? ((icon-1)*-36) : 0)+'px 0px'};	
	},
		
	selectCheck : function(e,t) {
		var found = false;
		do{
			if(t.className && t.className.indexOf('nicEdit') != -1) {			
				return false;
			}
		} while(t = t.parentNode);
		this.fireEvent('blur',this.selectedInstance,t);
		this.lastSelectedInstance = this.selectedInstance;
		this.selectedInstance = null;
		return false;
	}
	
});
nicEditor = nicEditor.extend(bkEvent);

 
var nicEditorInstance = bkClass.extend({
	isSelected : false,
	
	construct : function(e,options,nicEditor) {
		this.ne = nicEditor;
		this.elm = this.e = e;
		this.options = options || {};
		
		newX = parseInt(e.getStyle('width')) || e.clientWidth;
		newY = parseInt(e.getStyle('height')) || e.clientHeight;
		this.initialHeight = newY-8;
		
		var isTextarea = (e.nodeName.toLowerCase() == "textarea");
		if(isTextarea || this.options.hasPanel) {
			var ie7s = (bkLib.isMSIE && !((typeof document.body.style.maxHeight != "undefined") && document.compatMode == "CSS1Compat"))
			//var s = {width: newX+'px', border : '1px solid #ccc', borderTop : 0, overflowY : 'auto', overflowX: 'hidden' };
			var s = {width: 'auto', border : '1px solid #ccc', borderTop : 0, overflowY : 'auto', overflowX: 'hidden' };
			s[(ie7s) ? 'height' : 'maxHeight'] = (this.ne.options.maxHeight) ? this.ne.options.maxHeight+'px' : null;
			this.editorContain = new bkElement('DIV').setStyle(s).appendBefore(e);
			//var editorElm = new bkElement('DIV').setStyle({width : (newX-8)+'px', margin: '4px', minHeight : newY+'px'}).addClass('main').appendTo(this.editorContain);
			var editorElm = new bkElement('DIV').setStyle({width : 'auto', margin: '4px', minHeight : newY+'px'}).addClass('main').appendTo(this.editorContain);

			e.setStyle({display : 'none'});
				
			editorElm.innerHTML = e.innerHTML;		
			if(isTextarea) {
				editorElm.setContent(e.value);
				this.copyElm = e;
				var f = e.parentTag('FORM');
				if(f) { bkLib.addEvent( f, 'submit', this.saveContent.closure(this)); }
			}
			//editorElm.setStyle((ie7s) ? {height : newY+'px'} : {overflow: 'hidden'});
			editorElm.setStyle( {height : newY+'px', overflowY : 'auto', overflowX : 'hidden'});
			this.elm = editorElm;	
		}
		this.ne.addEvent('blur',this.blur.closure(this));

		this.init();
		this.blur();
	},
	
	init : function() {
		this.elm.setAttribute('contentEditable','true');	
		if(this.getContent() == "") {
			this.setContent('<br />');
		}
		this.instanceDoc = document.defaultView;
		this.elm.addEvent('mousedown',this.selected.closureListener(this)).addEvent('keypress',this.keyDown.closureListener(this)).addEvent('focus',this.selected.closure(this)).addEvent('blur',this.blur.closure(this)).addEvent('keyup',this.selected.closure(this));
		this.ne.fireEvent('add',this);
	},
	
	remove : function() {
		this.saveContent();
		if(this.copyElm || this.options.hasPanel) {
			this.editorContain.remove();
			this.e.setStyle({'display' : 'block'});
			this.ne.removePanel();
		}
		this.disable();
		this.ne.fireEvent('remove',this);
	},
	
	disable : function() {
		this.elm.setAttribute('contentEditable','false');
	},
	
	getSel : function() {
		return (window.getSelection) ? window.getSelection() : document.selection;	
	},
	
	getRng : function() {
		var s = this.getSel();
		if(!s || s.rangeCount === 0) { return; }
		return (s.rangeCount > 0) ? s.getRangeAt(0) : s.createRange();
	},
	
	selRng : function(rng,s) {
		if(window.getSelection) {
			s.removeAllRanges();
			s.addRange(rng);
		} else {
			rng.select();
		}
	},
	
	selElm : function() {
		var r = this.getRng();
		if(!r) { return; }
		if(r.startContainer) {
			var contain = r.startContainer;
			if(r.cloneContents().childNodes.length == 1) {
				for(var i=0;i<contain.childNodes.length;i++) {
					var rng = contain.childNodes[i].ownerDocument.createRange();
					rng.selectNode(contain.childNodes[i]);					
					if(r.compareBoundaryPoints(Range.START_TO_START,rng) != 1 && 
						r.compareBoundaryPoints(Range.END_TO_END,rng) != -1) {
						return $BK(contain.childNodes[i]);
					}
				}
			}
			return $BK(contain);
		} else {
			return $BK((this.getSel().type == "Control") ? r.item(0) : r.parentElement());
		}
	},
	
	saveRng : function() {
		this.savedRange = this.getRng();
		this.savedSel = this.getSel();
	},
	
	restoreRng : function() {
		if(this.savedRange) {
			this.selRng(this.savedRange,this.savedSel);
		}
	},
	
	keyDown : function(e,t) {
		if(e.ctrlKey) {
			this.ne.fireEvent('key',this,e);
		}
	},
	
	selected : function(e,t) {
		if(!t && !(t = this.selElm)) { 
			t = this.selElm(); 
		}
		if(!e.ctrlKey) {
			var selInstance = this.ne.selectedInstance;
			if(selInstance != this) {
				if(selInstance) {
					this.ne.fireEvent('blur',selInstance,t);
				}
				this.ne.selectedInstance = this;	
				this.ne.fireEvent('focus',selInstance,t);
			}			
			//console.log(t.innerHTML);			
			this.ne.fireEvent('selected',selInstance,t);
			this.isFocused = true;
			this.elm.addClass('selected');
		}
		return false;
	},
	
	//--888
	/*
	selectedFromButton : function(t) {
		if(!t && !(t = this.selElm)) { t = this.selElm(); }
		var selInstance = this.ne.selectedInstance;
		if(selInstance != this) {
			if(selInstance) {
				this.ne.fireEvent('blur',selInstance,t);
			}
			this.ne.selectedInstance = this;	
			this.ne.fireEvent('focus',selInstance,t);
		}
		
		this.ne.fireEvent('selected',selInstance,t);
		this.isFocused = true;
		this.elm.addClass('selected');
	}, 
	*/
	
	blur : function() {
		this.isFocused = false;
		this.elm.removeClass('selected');
	},
	
	saveContent : function() {
		if(this.copyElm || this.options.hasPanel) {
			this.ne.fireEvent('save',this);
			(this.copyElm) ? this.copyElm.value = this.getContent() : this.e.innerHTML = this.getContent();
		}	
	},
	
	getElm : function() {
		return this.elm;
	},
	
	getContent : function() {
		this.content = this.getElm().innerHTML;
		this.ne.fireEvent('get',this);
		return this.content;
	},
	
	setContent : function(e) {
		this.content = e;
		this.ne.fireEvent('set',this);
		this.elm.innerHTML = this.content;	
	},
	
	nicCommand : function(cmd,args) {
		// https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand#Commands
		// 'bold' 'italic' 'underline'
		//document.execCommand(cmd,false,args);
		if(!document.execCommand(cmd,false,args)) {
			alert("该浏览器不支持" + cmd + "命令: " + args);			
		}
		
//		if(document.queryCommandState) console.log(cmd + " 当前状态：" + document.queryCommandState(cmd));
//		if(document.queryCommandEnabled) console.log(cmd + " 当前Enabled：" + document.queryCommandEnabled(cmd));
//		if(document.queryCommandText) console.log(cmd + " 当前Text：" + document.queryCommandText(cmd));
//		if(document.queryCommandSupported) console.log(cmd + " 当前Supported：" + document.queryCommandSupported(cmd));
//		if(document.queryCommandIndeterm) console.log(cmd + " 当前Indeterm：" + document.queryCommandIndeterm(cmd));
	}		
});

var nicEditorIFrameInstance = nicEditorInstance.extend({
	savedStyles : [],
	
	init : function() {	
		var c = this.elm.innerHTML.replace(/^\s+|\s+$/g, '');
		this.elm.innerHTML = '';
		(!c) ? c = "<br />" : c;
		this.initialContent = c;
		
		this.elmFrame = new bkElement('iframe').setAttributes({'src' : 'javascript:;', 'frameBorder' : 0, 'allowTransparency' : 'true', 'scrolling' : 'no'}).setStyle({height: '100px', width: '100%'}).addClass('frame').appendTo(this.elm);

		if(this.copyElm) { this.elmFrame.setStyle({width : (this.elm.offsetWidth-4)+'px'}); }
		
		var styleList = ['font-size','font-family','font-weight','color'];
		for(itm in styleList) {
			this.savedStyles[bkLib.camelize(itm)] = this.elm.getStyle(itm);
		}
     	
		setTimeout(this.initFrame.closure(this),50);
	},
	
	disable : function() {
		this.elm.innerHTML = this.getContent();
	},
	
	initFrame : function() {
		var fd = $BK(this.elmFrame.contentWindow.document);
		fd.designMode = "on";		
		fd.open();
		var css = this.ne.options.externalCSS;
		fd.write('<html><head>'+((css) ? '<link href="'+css+'" rel="stylesheet" type="text/css" />' : '')+'</head><body id="nicEditContent" style="margin: 0 !important; background-color: transparent !important;">'+this.initialContent+'</body></html>');
		fd.close();
		this.frameDoc = fd;

		this.frameWin = $BK(this.elmFrame.contentWindow);
		this.frameContent = $BK(this.frameWin.document.body).setStyle(this.savedStyles);
		this.instanceDoc = this.frameWin.document.defaultView;
		
		this.heightUpdate();
		this.frameDoc.addEvent('mousedown', this.selected.closureListener(this)).addEvent('keyup',this.heightUpdate.closureListener(this)).addEvent('keydown',this.keyDown.closureListener(this)).addEvent('keyup',this.selected.closure(this));
		this.ne.fireEvent('add',this);
	},
	
	getElm : function() {
		return this.frameContent;
	},
	
	setContent : function(c) {
		this.content = c;
		this.ne.fireEvent('set',this);
		this.frameContent.innerHTML = this.content;	
		this.heightUpdate();
	},
	
	getSel : function() {
		return (this.frameWin) ? this.frameWin.getSelection() : this.frameDoc.selection;
	},
	
	heightUpdate : function() {	
		this.elmFrame.style.height = Math.max(this.frameContent.offsetHeight,this.initialHeight)+'px';
	},
    
	nicCommand : function(cmd,args) {
		//this.frameDoc.execCommand(cmd,false,args);
		if(!this.frameDoc.execCommand(cmd,false,args)) {
			alert("该浏览器不支持" + cmd + "命令--" + args);			
		}
		setTimeout(this.heightUpdate.closure(this),100);
	}

	
});
var nicEditorPanel = bkClass.extend({
	construct : function(e,options,nicEditor) {
		this.elm = e;
		this.options = options;
		this.ne = nicEditor;
		this.panelButtons = new Array();
		this.buttonList = bkExtend([],this.ne.options.buttonList);
		
		//this.panelContain = new bkElement('DIV').setStyle({overflow : 'hidden', width : '100%', border : '1px solid #cccccc', backgroundColor : '#efefef'}).addClass('panelContain');
		this.panelContain = new bkElement('DIV').setStyle({overflow : 'hidden', width : 'auto', border : '1px solid #cccccc', backgroundColor : '#efefef'}).addClass('panelContain');
		this.panelElm = new bkElement('DIV').setStyle({margin : '2px', marginTop : '0px', zoom : 1, overflow : 'hidden'}).addClass('panel').appendTo(this.panelContain);
		this.panelContain.appendTo(e);

		var opt = this.ne.options;
		var buttons = opt.buttons;
		for(button in buttons) {
				this.addButton(button,opt,true);
		}
		this.reorder();
		e.noSelect();
	},
	
	addButton : function(buttonName,options,noOrder) {
		var button = options.buttons[buttonName];
		var type = (button['type']) ? eval('(typeof('+button['type']+') == "undefined") ? null : '+button['type']+';') : nicEditorButton;
		var hasButton = bkLib.inArray(this.buttonList,buttonName);
		if(type && (hasButton || this.ne.options.fullPanel)) {
			this.panelButtons.push(new type(this.panelElm,buttonName,options,this.ne));
			if(!hasButton) {	
				this.buttonList.push(buttonName);
			}
		}
	},
	
	findButton : function(itm) {
		for(var i=0;i<this.panelButtons.length;i++) {
			if(this.panelButtons[i].name == itm)
				return this.panelButtons[i];
		}	
	},
	
	reorder : function() {
		var bl = this.buttonList;
		for(var i=0;i<bl.length;i++) {
			var button = this.findButton(bl[i]);
			if(button) {
				this.panelElm.appendChild(button.margin);
			}
		}	
	},
	
	remove : function() {
		this.elm.remove();
	}
});
var nicEditorButton = bkClass.extend({
	
	construct : function(e,buttonName,options,nicEditor) {
		this.options = options.buttons[buttonName];
		this.name = buttonName;
		this.ne = nicEditor;
		this.elm = e;

		this.margin = new bkElement('DIV').setStyle({'float' : 'left', marginTop : '2px'}).appendTo(e);
		this.contain = new bkElement('DIV').setStyle({width : '40px', height : '40px'}).addClass('buttonContain').appendTo(this.margin); // 20 px , 20 px
		this.border = new bkElement('DIV').setStyle({backgroundColor : '#efefef', border : '1px solid #efefef'}).appendTo(this.contain);
		this.button = new bkElement('DIV').setStyle({width : '36px', height : '36px', overflow : 'hidden', zoom : 1, cursor : 'pointer'}).addClass('button').setStyle(this.ne.getIcon(buttonName,options)).appendTo(this.border); // 18 px, 18 px
		this.button.addEvent('mouseover', this.hoverOn.closure(this)).addEvent('mouseout',this.hoverOff.closure(this)).addEvent('mousedown',this.mouseClick.closure(this)).noSelect();
		
		if(!window.opera) {
			this.button.onmousedown = this.button.onclick = bkLib.cancelEvent;
		}
		
		nicEditor.addEvent('selected', this.enable.closure(this)).addEvent('blur', this.disable.closure(this)).addEvent('key',this.key.closure(this));
		
		this.disable();
		this.init();
	},
	
	init : function() {  },
	
	hide : function() {
		this.contain.setStyle({display : 'none'});
	},
	
	updateState : function() {
		if(this.isDisabled) { this.setBg(); }
		else if(this.isHover) { this.setBg('hover'); }
		else if(this.isActive) { this.setBg('active'); }
		else { this.setBg(); }
	},
	
	setBg : function(state) {
		switch(state) {
			case 'hover':
				var stateStyle = {border : '1px solid #666', backgroundColor : '#ddd'};
				break;
			case 'active':
				var stateStyle = {border : '1px solid #666', backgroundColor : '#ccc'};
				break;
			default:
				var stateStyle = {border : '1px solid #efefef', backgroundColor : '#efefef'};	
		}
		this.border.setStyle(stateStyle).addClass('button-'+state);
	},
	
	checkNodes : function(e) {
		var elm = e;
		do {
			//console.log(elm.nodeName);
			
			if(this.options.tags && bkLib.inArray(this.options.tags,elm.nodeName)) {
				this.activate();
				return true;
			}
		// } while(elm = elm.parentNode && elm.className != "nicEdit");
		} while(elm = elm.parentNode && elm.className.indexOf('nicEdit') < 0);
			//t.className.indexOf('nicEdit') != -1
		elm = $BK(e);
		
		while(elm.nodeType == Node.TEXT_NODE) { // Node.TEXT_NODE = 3
			elm = $BK(elm.parentNode);
		}
		if(this.options.css) {
			for(itm in this.options.css) {
				if(elm.getStyle(itm,this.ne.selectedInstance.instanceDoc) == this.options.css[itm]) {
					this.activate();
					return true;
				}
			}
		}
		
		// wcjboy
		if(this.options.command) {
			if(document.queryCommandState && document.queryCommandState(this.options.command)) {
				this.activate();
				return true;
			}
		}
		
		this.deactivate();
		return false;
	},
	
	activate : function() {
		if(!this.isDisabled) {
			this.isActive = true;
			this.updateState();	
			this.ne.fireEvent('buttonActivate',this);
		}
	},
	
	deactivate : function() {
		this.isActive = false;
		this.updateState();	
		if(!this.isDisabled) {
			this.ne.fireEvent('buttonDeactivate',this);
		}
	},
	
	enable : function(ins,t) {
		this.isDisabled = false;
		this.contain.setStyle({'opacity' : 1}).addClass('buttonEnabled');
		this.updateState();
		this.checkNodes(t);
	},
	
	disable : function(ins,t) {		
		this.isDisabled = true;
		this.contain.setStyle({'opacity' : 0.6}).removeClass('buttonEnabled');
		this.updateState();	
	},
	
	toggleActive : function() {
		(this.isActive) ? this.deactivate() : this.activate();	
	},
	
	hoverOn : function() {
		if(!this.isDisabled) {
			this.isHover = true;
			this.updateState();
			this.ne.fireEvent("buttonOver",this);
		}
	}, 
	
	hoverOff : function() {
		this.isHover = false;
		this.updateState();
		this.ne.fireEvent("buttonOut",this);
	},
	
	mouseClick : function() {
		if(this.options.command) {
			this.ne.nicCommand(this.options.command,this.options.commandArgs);
			if(!this.options.noActive) {
				this.toggleActive();
			}
		}
		this.ne.fireEvent("buttonClick",this);
	},
	
	key : function(nicInstance,e) {
		if(this.options.key && e.ctrlKey && String.fromCharCode(e.keyCode || e.charCode).toLowerCase() == this.options.key) {
			this.mouseClick();
			if(e.preventDefault) e.preventDefault();
		}
	}
	
});

 
var nicPlugin = bkClass.extend({
	
	construct : function(nicEditor,options) {
		this.options = options;
		this.ne = nicEditor;
		this.ne.addEvent('panel',this.loadPanel.closure(this));
		
		this.init();
	},

	loadPanel : function(np) {
		var buttons = this.options.buttons;
		for(var button in buttons) {
			np.addButton(button,this.options);
		}
		np.reorder();
	},

	init : function() {  }
});



 
 /* START CONFIG */
var nicPaneOptions = { };
/* END CONFIG */

var nicEditorPane = bkClass.extend({
	construct : function(elm,nicEditor,options,openButton) {
		this.ne = nicEditor;
		this.elm = elm;
		this.pos = elm.pos();
		
		//this.contain = new bkElement('div').setStyle({zIndex : '99999', overflow : 'hidden', position : 'absolute', left : this.pos[0]+'px', top : this.pos[1]+'px'})
		this.contain = new bkElement('div').setStyle({zIndex : '99999', overflow : 'visible', position : 'absolute', left : this.pos[0]+'px', top : this.pos[1]+'px'})
		this.pane = new bkElement('div').setStyle({fontSize : '12px', border : '1px solid #ccc', 'overflow': 'hidden', padding : '4px', textAlign: 'left', backgroundColor : '#ffffc9'}).addClass('pane').setStyle(options).appendTo(this.contain);
		
		if(openButton && !openButton.options.noClose) { // 16px, 16px 
			this.close = new bkElement('div').setStyle({'float' : 'right', height: '32px', width : '32px', cursor : 'pointer'}).setStyle(this.ne.getIcon('close',nicPaneOptions)).addEvent('mousedown',openButton.removePane.closure(this)).appendTo(this.pane);
		}
		
		// wcjboy
		//this.contain.noSelect().appendTo(document.body);
		var x;
		if(this.ne.panelInstanceId != '' && typeof this.ne.panelInstanceId === 'string' ) {
			x = document.getElementById(this.ne.panelInstanceId).parentElement;
		}else {
			x = document.getElementById("niceTextArea").parentElement;
		}
		// var x = document.getElementById("niceTextArea").parentElement; //document.getElementsByClassName("nicEdit-panelContain"); //document.getElementById("niceTextArea").parentElement;
		if(x !== undefined) {
			this.contain.noSelect().appendTo(x);
		}else {
			this.contain.noSelect().appendTo(document.body);
		}
		
		this.position();
		this.init();	
	},
	
	init : function() { },
	
	position : function() {
		if(this.ne.nicPanel) {
			var panelElm = this.ne.nicPanel.elm;	
			var panelPos = panelElm.pos();
			var newLeft = panelPos[0]+parseInt(panelElm.getStyle('width'))-(parseInt(this.pane.getStyle('width'))+8);
			if(newLeft < this.pos[0]) {
				this.contain.setStyle({left : newLeft+'px'});
			}
		}
	},
	
	toggle : function() {
		this.isVisible = !this.isVisible;
		this.contain.setStyle({display : ((this.isVisible) ? 'block' : 'none')});
	},
	
	remove : function() {
		if(this.contain) {
			this.contain.remove();
			this.contain = null;
		}
	},
	
	append : function(c) {
		c.appendTo(this.pane);
	},
	
	setContent : function(c) {
		this.pane.setContent(c);
	}
	
});


 
var nicEditorAdvancedButton = nicEditorButton.extend({
	
	init : function() {
		this.ne.addEvent('selected',this.removePane.closure(this)).addEvent('blur',this.removePane.closure(this));	
	},
	
	mouseClick : function() {
		//-- 888
		if(this.isDisabled || (this.ne.nicPanel && this.ne.nicPanel.neInstance && !this.ne.nicPanel.neInstance.isFocused)) {
			if(this.ne.nicPanel && this.ne.nicPanel.neInstance) {
				//console.log("123");
				//this.ne.selectedInstance.saveRng();
				//this.ne.lastSelectedInstance = this.ne.selectedInstance;
				//this.ne.selectedInstance = null;
				this.ne.nicPanel.neInstance.elm.focus();
				//this.ne.selectedInstance.restoreRng();
				
				//this.ne.nicPanel.neInstance.selectedFromButton(this.ne.nicPanel.neInstance);
			}
		}
		
		if(!this.isDisabled) {
			if(this.pane && this.pane.pane) {
				this.removePane();
			} else {
				this.pane = new nicEditorPane(this.contain,this.ne,{width : (this.width || '270px'), backgroundColor : '#fff'},this);
				this.addPane();
				this.ne.selectedInstance.saveRng();
			}
		}
	},
	
	addForm : function(f,elm) {
		this.form = new bkElement('form').addEvent('submit',this.submit.closureListener(this));
		this.pane.append(this.form);
		this.inputs = {};
		
		for(itm in f) {
			var field = f[itm];
			var val = '';
			if(elm) {
				val = elm.getAttribute(itm);
			}
			if(!val) {
				val = field['value'] || '';
			}
			var type = f[itm].type;
			
			if(type == 'title') {
					new bkElement('div').setContent(field.txt).setStyle({fontSize : '14px', fontWeight: 'bold', padding : '0px', margin : '2px 0'}).appendTo(this.form);
			} else {
				var contain = new bkElement('div').setStyle({overflow : 'hidden', clear : 'both'}).appendTo(this.form);
				if(field.txt) {
					new bkElement('label').setAttributes({'for' : itm}).setContent(field.txt).setStyle({margin : '2px 4px', fontSize : '13px', width: '50px', lineHeight : '20px', textAlign : 'right', 'float' : 'left'}).appendTo(contain);
				}
				
				switch(type) {
					case 'text':
						this.inputs[itm] = new bkElement('input').setAttributes({id : itm, 'value' : val, 'type' : 'text'}).setStyle({margin : '2px 0', fontSize : '13px', 'float' : 'left', height : '20px', border : '1px solid #ccc', overflow : 'hidden'}).setStyle(field.style).appendTo(contain);
						break;
					case 'select':
						this.inputs[itm] = new bkElement('select').setAttributes({id : itm}).setStyle({border : '1px solid #ccc', 'float' : 'left', margin : '2px 0'}).appendTo(contain);
						for(opt in field.options) {
							var o = new bkElement('option').setAttributes({value : opt, selected : (opt == val) ? 'selected' : ''}).setContent(field.options[opt]).appendTo(this.inputs[itm]);
						}
						break;
					case 'content':
						this.inputs[itm] = new bkElement('textarea').setAttributes({id : itm}).setStyle({border : '1px solid #ccc', 'float' : 'left'}).setStyle(field.style).appendTo(contain);
						this.inputs[itm].value = val;
				}	
			}
		}
		new bkElement('input').setAttributes({'type' : 'submit'}).setStyle({backgroundColor : '#efefef',border : '1px solid #ccc', margin : '3px 0', 'float' : 'left', 'clear' : 'both'}).appendTo(this.form);
		this.form.onsubmit = bkLib.cancelEvent;	
	},
	
	submit : function() { },
	
	findElm : function(tag,attr,val) {
		var list = this.ne.selectedInstance.getElm().getElementsByTagName(tag);
		for(var i=0;i<list.length;i++) {
			if(list[i].getAttribute(attr) == val) {
				return $BK(list[i]);
			}
		}
	},
	
	removePane : function() {
		if(this.pane) {
			this.pane.remove();
			this.pane = null;
			this.ne.selectedInstance.restoreRng();
		}	
	}	
});


var nicButtonTips = bkClass.extend({
	construct : function(nicEditor) {
		this.ne = nicEditor;
		nicEditor.addEvent('buttonOver',this.show.closure(this)).addEvent('buttonOut',this.hide.closure(this));

	},
	
	show : function(button) {
		this.timer = setTimeout(this.create.closure(this,button),400);
	},
	
	create : function(button) {
		this.timer = null;
		if(!this.pane) {
			this.pane = new nicEditorPane(button.button,this.ne,{fontSize : '12px', marginTop : '5px'});
			this.pane.setContent(button.options.name);
		}		
	},
	
	hide : function(button) {
		if(this.timer) {
			clearTimeout(this.timer);
		}
		if(this.pane) {
			this.pane = this.pane.remove();
		}
	}
});
nicEditors.registerPlugin(nicButtonTips);



/* START CONFIG */
var nicLinkOptions = {
	buttons : {
		'link' : {name : 'Add Link', type : 'nicLinkButton', tags : ['A']},
		'unlink' : {name : 'Remove Link',  command : 'unlink', noActive : true}
	}
};
/* END CONFIG */

var nicLinkButton = nicEditorAdvancedButton.extend({	
	addPane : function() {
		this.ln = this.ne.selectedInstance.selElm().parentTag('A');
		this.addForm({
			'' : {type : 'title', txt : 'Add/Edit Link'},
			'href' : {type : 'text', txt : 'URL', value : 'http://', style : {width: '150px'}},
			'title' : {type : 'text', txt : 'Title'},
			'target' : {type : 'select', txt : 'Open In', options : {'' : 'Current Window', '_blank' : 'New Window'},style : {width : '100px'}}
		},this.ln);
	},
	
	submit : function(e) {
		var url = this.inputs['href'].value;
		if(url == "http://" || url == "") {
			alert("You must enter a URL to Create a Link");
			return false;
		}
		this.removePane();
		
		if(!this.ln) {
			var tmp = 'javascript:nicTemp();';
			this.ne.nicCommand("createlink",tmp);
			this.ln = this.findElm('A','href',tmp);
		}
		if(this.ln) {
			this.ln.setAttributes({
				href : this.inputs['href'].value,
				title : this.inputs['title'].value,
				target : this.inputs['target'].options[this.inputs['target'].selectedIndex].value
			});
		}
	}
});

nicEditors.registerPlugin(nicPlugin,nicLinkOptions);



/* START CONFIG */
var nicImageOptions = {
	buttons : {
		'image' : {name : '图片链接', type : 'nicImageButton', tags : ['IMG']}
	}
	
};
/* END CONFIG */

var nicImageButton = nicEditorAdvancedButton.extend({	
	addPane : function() {
		//this.im = this.ne.selectedInstance.selElm().parentTag('IMG');
		//console.log(this.ne.selectedInstance.selElm());
		
		if(this.ne.selectedInstance.selElm() == undefined || !this.ne.selectedInstance.isFocused) {
			this.removePane();
			alert("请先点击编辑区需要插入图片的位置。");			
			return;
		} else {
			//console.log('0012');
			this.im = this.ne.selectedInstance.selElm().parentTag('IMG');
		}
		this.addForm({
			'' : {type : 'title', txt : '图片链接'},
			'src' : {type : 'text', txt : '地址', 'value' : 'http://', style : {width: '150px'}},
			//'alt' : {type : 'text', txt : '替代', style : {width: '100px'}},
			'align' : {type : 'select', txt : '对齐', options : {none : '缺省','left' : '左对齐', 'right' : '右对齐'}}
		},this.im);
	},
	
	submit : function(e) {
		var src = this.inputs['src'].value;
		if(src == "" || src == "http://") {
			alert("必需输入一个合法的图片链接地址。");
			return false;
		}
		this.removePane();

		if(!this.im) {
			var tmp = 'javascript:nicImTemp();';
			this.ne.nicCommand("insertImage",tmp);
			this.im = this.findElm('IMG','src',tmp);
		}
		if(this.im) {
			this.im.setAttributes({
				src : this.inputs['src'].value,
				//alt : this.inputs['alt'].value,
				align : this.inputs['align'].value
			});
		}
	}
});

nicEditors.registerPlugin(nicPlugin,nicImageOptions);




/* START CONFIG */
var nicSaveOptions = {
	buttons : {
		'save' : {name : __('Save this content'), type : 'nicEditorSaveButton'}
	}
};
/* END CONFIG */

var nicEditorSaveButton = nicEditorButton.extend({
	init : function() {
		if(!this.ne.options.onSave) {
			this.margin.setStyle({'display' : 'none'});
		}
	},
	mouseClick : function() {
		var onSave = this.ne.options.onSave;
		var selectedInstance = this.ne.selectedInstance;
		onSave(selectedInstance.getContent(), selectedInstance.elm.id, selectedInstance);
	}
});

nicEditors.registerPlugin(nicPlugin,nicSaveOptions);


function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // only relatively recently standardized and is not supported in
            // some browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ( (node = el.firstChild) ) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}



/* atmoumou config */
var nicAtmoumouOptions = {
		buttons : {
			'atmoumou' : {name : '表情', type : 'nicAtmoumouButton'}
		}
		
	};

var nicAtmoumouButton = nicEditorAdvancedButton.extend({
	errorText : '@某人失败。',
	addPane : function() {		
		if(this.ne.selectedInstance.selElm() == undefined || !this.ne.selectedInstance.isFocused) {
			return this.onError("请先点击编辑区需要插入@某人的位置。");
		} 		
	    var container = new bkElement('div').setStyle({ padding: '10px' }).appendTo(this.pane.pane);	
		new bkElement('div').setStyle({ fontSize: '14px', fontWeight : 'bold', paddingBottom: '5px' }).setContent('@某人').appendTo(container);
			
		var userlistArr = neUserListMapObj[this.ne.panelInstanceId];
		if(typeof userlistArr != 'undefined') {			
			var length = userlistArr.length;
			var content = '<option value="0" selected="selected">无</option>';
			for(var i=0; i < length; i++) {
				var id = userlistArr[i][0];
				var name = userlistArr[i][1];														
				content += '<option value="' + id + '">'+ name + '</option>';
			}			
			var e2 = new bkElement('select').setAttributes({id : 'atSomeoneId'}).setStyle({ 'display': 'block'}).appendTo(container);
			e2.onchange = this.atSomeone.closure(this, 'atSomeone');
			e2.setContent(content);			
		}
		
	},
  onError : function(msg) {
    this.removePane();
    alert(msg || "@某人失败！");
  },
  
  atSomeone : function(msg) {
	    var ee = document.getElementById("atSomeoneId");
	    var id = ee.options[ee.selectedIndex].value;
	    var name = ee.options[ee.selectedIndex].text;
	    var hhh = '<i atsid="' + id + '" style="color: #D60;">@' + name + '</i>：';
	    this.removePane();
	    pasteHtmlAtCaret(hhh);    
	    return;
	  }
});

nicEditors.registerPlugin(nicPlugin,nicAtmoumouOptions);

/* Emoji Config */
var nicEmojiOptions = {
		buttons : {
			'emoji' : {name : '表情', type : 'nicEmojiButton'}
		}
		
	};

//var smile='<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" style="width: 36px!important; height: 36px!important; background: url(nice/nicEditorIcons-large-m.png) -828px 0px;">';
//var smile='<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" style="width: 22px!important; height: 22px!important; background: url(nice/nicEditorIcons-large-m.png) ';

var smile='<img src="nice/empty22.png" style="width: 22px!important; height: 22px!important; background: url(nice/nicEditorIcons-large-m.png) ';
var grinning = smile + '-88px -36px;">';
var worried = smile + '-220px -36px;">';
var thumbup = smile + '0px -36px;">';
var thumbdown = smile + '-22px -36px;">';
var angry = smile + '-44px -36px;">';
var facepunch = smile + '-66px -36px;">';
var satisfied = smile + '-110px -36px;">';
var sleeping = smile + '-132px -36px;">';
var smirk = smile + '-154px -36px;">';
var winking = smile + '-176px -36px;">';
var weary = smile + '-198px -36px;">';
var badsmile = smile + '-264px -36px;">';
var bigcry = smile + '-286px -36px;">';
var bigshy = smile + '-308px -36px;">';
var crysmile = smile + '-330px -36px;">';
var horror = smile + '-352px -36px;">';


var nicEmojiButton = nicEditorAdvancedButton.extend({
	errorText : '插入表情失败。',
	addPane : function() {		
		if(this.ne.selectedInstance.selElm() == undefined || !this.ne.selectedInstance.isFocused) {
			return this.onError("请先点击编辑区需要插入表情的位置。");
		} else {
			//this.emo = this.ne.selectedInstance.selElm().selfTag(); //.parentTag('IMG');
		}		
	    var container = new bkElement('div').setStyle({ padding: '10px' }).appendTo(this.pane.pane);	
		new bkElement('div').setStyle({ fontSize: '14px', fontWeight : 'bold', paddingBottom: '5px' }).setContent('表情').appendTo(container);
			
		var e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -88px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'grinning');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -220px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'worried');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) 0px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'thumbup');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -22px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'thumbdown');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -44px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'angry');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -66px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'facepunch');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -110px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'satisfied');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -132px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'sleeping');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -154px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'smirk');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -176px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'winking');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -198px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'weary');
		
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -264px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'badsmile');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -286px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'bigcry');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -308px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'bigshy');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -330px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'crysmile');
		e1 = new bkElement('div').setStyle({ 'float': 'left', margin: '7px', width: '22px', height: '22px', background:'url(nice/nicEditorIcons-large-m.png) -352px -36px'}).appendTo(container);
		e1.onclick = this.insertEmoji.closure(this, 'horror');
	},
  onError : function(msg) {
    this.removePane();
    alert(msg || "插入表情失败！");
  },
  
  atSomeone : function(msg) {
	    var ee = document.getElementById("atSomeoneId");
	    var id = ee.options[ee.selectedIndex].value;
	    var name = ee.options[ee.selectedIndex].text;
	    var hhh = '<i atsid="' + id + '" style="color: #D60;">@' + name + '</i>：';
	    this.removePane();
	    pasteHtmlAtCaret(hhh);    
	    return;
	  },

  insertEmoji : function(emotion) {  
    //new bkElement('span').setContent('表情').appendTo(this.emo);
    var hhh = grinning;
    switch(emotion) {
	    case 'grinning' : hhh = grinning; break;
	    case 'worried' : hhh = worried; break;
	    case 'thumbup' : hhh = thumbup; break;
	    case 'thumbdown' : hhh = thumbdown; break;
	    case 'angry' : hhh = angry; break;
	    case 'facepunch' : hhh = facepunch; break;
	    case 'satisfied' : hhh = satisfied; break;
	    case 'sleeping' : hhh = sleeping; break;
	    case 'smirk' : hhh = smirk; break;
	    case 'winking' : hhh = winking; break;
	    case 'weary' : hhh = weary; break;
	    case 'badsmile' : hhh = badsmile; break;
	    case 'bigcry' : hhh = bigcry; break;
	    case 'bigshy' : hhh = bigshy; break;
	    case 'crysmile' : hhh = crysmile; break;
	    case 'horror' : hhh = horror; break;
	    case 'atSomeone': 
	    	document.getElementById('atSomeoneId').style.display = 'block';
	    	return;//    	break;
    }
    this.removePane();
    pasteHtmlAtCaret(hhh);    
    return;
  }
});

nicEditors.registerPlugin(nicPlugin,nicEmojiOptions);

////------- upload video
var nicUploadVideoOptions = {
		buttons : {
			'uploadvideo' : {name : '上传视频/音频', type : 'nicUploadVideoButton'}
		}
		
	};
var nicUploadVideoButton = nicEditorAdvancedButton.extend({
	nicURI : '/uploadVideoNiceFile.do',
	errorText : '上传视频/音频失败。',
	
	addPane : function() {		
		if (window.FormData && window.File && window.FileReader && window.FileList) {
			  // Great success! All the File APIs are supported.
			} else {
				return this.onError("该浏览器不支持视频/音频上传功能，请用 Chrome, Firefox浏览器.");
			}	
		if(this.ne.selectedInstance.selElm() == undefined || !this.ne.selectedInstance.isFocused) {
			return this.onError("请先点击编辑区需要插入视频/音频的位置。");
		} else {
			//this.im = this.ne.selectedInstance.selElm().parentTag('IMG');
		}    
	
	    var container = new bkElement('div')
	      .setStyle({ padding: '10px' })
	      .appendTo(this.pane.pane);
	
			new bkElement('div')
	      .setStyle({ fontSize: '14px', fontWeight : 'bold', paddingBottom: '5px' })
	      .setContent('上传视频/音频')
	      .appendTo(container);
	
	    this.fileInput = new bkElement('input')
	      .setAttributes({ 'type' : 'file' })
	      .appendTo(container);
	
	    this.progress = new bkElement('progress')
	      .setStyle({ width : '100%', display: 'none' })
	      .setAttributes('max', 100)
	      .appendTo(container);
	
	    this.fileInput.onchange = this.uploadVideoFile.closure(this);
	},

  onError : function(msg) {
    this.removePane();
    alert(msg || "上传视频/音频失败！");
  },

  uploadVideoFile : function() {
    var file = this.fileInput.files[0];
    var exists; 
    if(!file) {
    	alert("该浏览器不支持视频/音频上传功能。");
    	return;
    }else if(!file.type.match(/video\/mp4/) && !file.type.match(/audio\/mp3/)) {
    	exists = new RegExp("\.mp4$", 'i').test(file.name);
    	//alert(exists);
    	if(!exists) {
    		exists = new RegExp("\.mp3$", 'i').test(file.name);
    		if(!exists) {
    			this.onError("只有mp4视频文件或mp3音频文件可以上传！");
        		return;
    		}
    	} 
    }
    if(file.size > 10000000) { // 10MBtyes
    	this.onError("视频/音频文件太大，最大尺寸为10MBtyes！");
		return;
    }
    
    this.fileInput.setStyle({ display: 'none' });
    this.setProgress(0);
    
    var videoFileName = file.name;

    var fd = new FormData(); // https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
    fd.append("video", file, videoFileName);

    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      try {
        var data = JSON.parse(xhr.responseText).data;
      } catch(e) {
        return this.onError();
      }
      if(data.error) {
        return this.onError(data.error);
      }
      this.onVideoUploaded(data, file.type);
    }.closure(this);
    xhr.onerror = this.onError.closure(this);
    xhr.upload.onprogress = function(e) {
      this.setProgress(e.loaded / e.total);
    }.closure(this);
    xhr.open("POST", this.ne.options.uploadVideoURI || this.nicURI);
    xhr.send(fd);   
  },

  setProgress : function(percent) {
    this.progress.setStyle({ display: 'block' });
    if(percent <= 1.0) {  // < .98
      this.progress.value = percent;
    } else {
      this.progress.removeAttribute('value');
    }
  },

  onVideoUploaded : function(options, mediaType) {
    this.removePane();
    var src = options.link;
    
    var hhh = '不支持该视频/音频格式：' + mediaType;
    
    if(mediaType.match(/video\/mp4/)) {
    	 hhh = '<video controls="controls" autoplay="autoplay"><source src="' + src + '" type="video/mp4" />'
    		+ '当视频无法播放，可<a href="' + src + '">点击下载</a>.</video>';
    } else if(mediaType.match(/audio\/mp3/)) {
    	hhh = '<audio controls="controls" autoplay="autoplay"><source src="' + src + '" type="audio/mpeg" />'
		+ '当音频无法播放，可<a href="' + src + '">点击下载</a>.</audio>';
    }    
    
    pasteHtmlAtCaret(hhh);    
    return;
  }
});

nicEditors.registerPlugin(nicPlugin,nicUploadVideoOptions);


////------ upload image
/* START CONFIG */
var nicUploadOptions = {
	buttons : {
		'upload' : {name : '上传图片', type : 'nicUploadButton'}
	}
	
};
/* END CONFIG */

//need to check Canvas 

function dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);
      return new Blob([raw], {type: contentType});
    }
    
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
  };

var nicUploadButton = nicEditorAdvancedButton.extend({	
	nicURI : 'https://api.imgur.com/3/image',
	errorText : '上传图片失败。',

	addPane : function() {
		
	if (window.FormData && window.File && window.FileReader && window.FileList && window.Blob) {
		  // Great success! All the File APIs are supported.
		} else {
			return this.onError("该浏览器不支持图片上传功能，请用 Chrome, Firefox浏览器.");
		}
    
	 //this.im = this.ne.selectedInstance.selElm().parentTag('IMG');
	if(this.ne.selectedInstance.selElm() == undefined || !this.ne.selectedInstance.isFocused) {
		return this.onError("请先点击编辑区需要插入图片的位置。");
	} else {
		this.im = this.ne.selectedInstance.selElm().parentTag('IMG');
	}
    

    var container = new bkElement('div')
      .setStyle({ padding: '10px' })
      .appendTo(this.pane.pane);

		new bkElement('div')
      .setStyle({ fontSize: '14px', fontWeight : 'bold', paddingBottom: '5px' })
      .setContent('上传图片')
      .appendTo(container);

    this.fileInput = new bkElement('input')
      .setAttributes({ 'type' : 'file' })
      .appendTo(container);

    this.progress = new bkElement('progress')
      .setStyle({ width : '100%', display: 'none' })
      .setAttributes('max', 100)
      .appendTo(container);

    this.fileInput.onchange = this.uploadFile.closure(this);
	},

  onError : function(msg) {
    this.removePane();
    alert(msg || "上传图片失败！");
  },

  uploadFile : function() {
    var file = this.fileInput.files[0];
    if(!file) {
    	alert("该浏览器不支持图片上传功能。");
    	return;
    }else if(!file.type.match(/image.*/)) {
    	//alert(file.type);
    	var exists = new RegExp("\.png$|\.bmp$|\.gif$|\.jpg$|\.jpeg$", 'i').test(file.name);
    	//alert(exists);
    	if(!exists) {
    		this.onError("只有图片文件可以上传！");
    		return;
    	} 
    }
    
    // if(!file || !file.type.match(/image.*/)) {
    //    this.onError("只有图片文件可以上传！");
    //    return;
    // }
    
    // var fileTypes = ["image/jpeg", "image/gif"]; // ["image/jpeg", "image/gif", "image/bmp", "image/png"];
    var filetype = "image/jpeg";
    if(file.type === "image/gif" ) {
        var fd = new FormData(); // https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
        fd.append("image", file, imgFileName);

        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          try {
            var data = JSON.parse(xhr.responseText).data;
          } catch(e) {
            return this.onError();
          }
          if(data.error) {
            return this.onError(data.error);
          }
          this.onUploaded(data);
        }.closure(this);
        xhr.onerror = this.onError.closure(this);
        xhr.upload.onprogress = function(e) {
          this.setProgress(e.loaded / e.total);
        }.closure(this);
        //xhr.setRequestHeader('Authorization', 'Client-ID c37fc05199a05b7');
        xhr.open("POST", this.ne.options.uploadURI || this.nicURI);
        xhr.send(fd);
        
        return;
    }
//    if( fileTypes.indexOf(file.type) > -1) {
//    	filetype = file.type;
//    }
    
    this.fileInput.setStyle({ display: 'none' });
    this.setProgress(0);
    
    var imgFileName = file.name;
    //console.log(file.name);
    try {
        var b = new Blob();
        //console.log("0010");
        
        //----------- Begin to Resize image
        /* begin to resize the image */
        var img = document.createElement("img");
        var reader = new FileReader();    
        var This__ = this;
        reader.onload = function(e) {
        	img.src = e.target.result;
        	img.onload = function (imageEvent) {
                // Resize the image
                var canvas = document.createElement('canvas');        	
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                var MAX_WIDTH = 580;
                var MAX_HEIGHT = 580;
                var width = img.width;
                var height = img.height;
                //console.log(width + " - " + height);
                if (width > height) {
                  if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                  }
                } else {
                  if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                  }
                }
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                var dataurl = canvas.toDataURL(filetype); //canvas.toDataURL("image/png"); canvas.toDataURL("image/jpeg", 1.0);          
                var blob = dataURLToBlob(dataurl); //dataURItoBlob
                
                var fd = new FormData(); // https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
                fd.append("image", blob, imgFileName);
                var xhr = new XMLHttpRequest();
                
                xhr.onload = function() {
                  try {
                    var data = JSON.parse(xhr.responseText).data;
                  } catch(e) {
                    return This__.onError();
                  }
                  if(data.error) {
                    return This__.onError(data.error);
                  }
                  This__.onUploaded(data);
                }.closure(This__);
                xhr.onerror = This__.onError.closure(This__);
                xhr.upload.onprogress = function(e) {           	
                	This__.setProgress(e.loaded / e.total);
                }.closure(This__);
                //xhr.setRequestHeader('Authorization', 'Client-ID c37fc05199a05b7');
                
              //xhr.open("POST", '/uploadNiceFile.do');
                xhr.open("POST", This__.ne.options.uploadURI || This__.nicURI);            
                xhr.send(fd);
            }    	
        }
        reader.readAsDataURL(file);        
        //----------- End of Resize image        
        
    } catch(e) {
    	//console.log("0011");
        var fd = new FormData(); // https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
        fd.append("image", file, imgFileName);

        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          try {
            var data = JSON.parse(xhr.responseText).data;
          } catch(e) {
            return this.onError();
          }
          if(data.error) {
            return this.onError(data.error);
          }
          this.onUploaded(data);
        }.closure(this);
        xhr.onerror = this.onError.closure(this);
        xhr.upload.onprogress = function(e) {
          this.setProgress(e.loaded / e.total);
        }.closure(this);
        //xhr.setRequestHeader('Authorization', 'Client-ID c37fc05199a05b7');
        xhr.open("POST", this.ne.options.uploadURI || this.nicURI);
        xhr.send(fd);
    }    
  },

  setProgress : function(percent) {
    this.progress.setStyle({ display: 'block' });
    if(percent <= 1.0) {  // < .98
      this.progress.value = percent;
    } else {
      this.progress.removeAttribute('value');
    }
  },

  onUploaded : function(options) {
	
    this.removePane();
    var src = this.ne.options.baseUrl + options.link;
    var hhh = '<img src="' + src + '">';
    pasteHtmlAtCaret(hhh);    
    return;
	  
	/*	  
    this.removePane();
    var src = options.link;
    if(!this.im) {
      this.ne.selectedInstance.restoreRng();
      var tmp = 'javascript:nicImTemp();';
      this.ne.nicCommand("insertImage", src);
      this.im = this.findElm('IMG','src', src);
    }
    //var w = parseInt(this.ne.selectedInstance.elm.getStyle('width'));
    if(this.im) {
      this.im.setAttributes({
        src : src
        // ,
        // width : (w && options.width) ? Math.min(w, options.width) : ''
      });
    }
    */
  }
});

nicEditors.registerPlugin(nicPlugin,nicUploadOptions);



var nicXHTML = bkClass.extend({
	stripAttributes : ['_moz_dirty','_moz_resizing','_extended'],
	noShort : ['style','title','script','textarea','a'],
	cssReplace : {'font-weight:bold;' : 'strong', 'font-style:italic;' : 'em'},
	sizes : {1 : 'xx-small', 2 : 'x-small', 3 : 'small', 4 : 'medium', 5 : 'large', 6 : 'x-large'},
	
	construct : function(nicEditor) {
		this.ne = nicEditor;
		if(this.ne.options.xhtml) {
			nicEditor.addEvent('get',this.cleanup.closure(this));
		}
	},
	
	cleanup : function(ni) {
		var node = ni.getElm();
		var xhtml = this.toXHTML(node);
		ni.content = xhtml;
	},
	
	toXHTML : function(n,r,d) {
		var txt = '';
		var attrTxt = '';
		var cssTxt = '';
		var nType = n.nodeType;
		var nName = n.nodeName.toLowerCase();
		var nChild = n.hasChildNodes && n.hasChildNodes();
		var extraNodes = new Array();
		
		switch(nType) {
			case 1:
				var nAttributes = n.attributes;
				
				switch(nName) {
					case 'b':
						nName = 'strong';
						break;
					case 'i':
						nName = 'em';
						break;
					case 'font':
						nName = 'span';
						break;
				}
				
				if(r) {
					for(var i=0;i<nAttributes.length;i++) {
						var attr = nAttributes[i];
						
						var attributeName = attr.nodeName.toLowerCase();
						var attributeValue = attr.nodeValue;
						
						if(!attr.specified || !attributeValue || bkLib.inArray(this.stripAttributes,attributeName) || typeof(attributeValue) == "function") {
							continue;
						}
						
						switch(attributeName) {
							case 'style':
								var css = attributeValue.replace(/ /g,"");
								for(itm in this.cssReplace) {
									if(css.indexOf(itm) != -1) {
										extraNodes.push(this.cssReplace[itm]);
										css = css.replace(itm,'');
									}
								}
								cssTxt += css;
								attributeValue = "";
							break;
							case 'class':
								attributeValue = attributeValue.replace("Apple-style-span","");
							break;
							case 'size':
								cssTxt += "font-size:"+this.sizes[attributeValue]+';';
								attributeValue = "";
							break;
						}
						
						if(attributeValue) {
							attrTxt += ' '+attributeName+'="'+attributeValue+'"';
						}
					}

					if(cssTxt) {
						attrTxt += ' style="'+cssTxt+'"';
					}

					for(var i=0;i<extraNodes.length;i++) {
						txt += '<'+extraNodes[i]+'>';
					}
				
					if(attrTxt == "" && nName == "span") {
						r = false;
					}
					if(r) {
						txt += '<'+nName;
						if(nName != 'br') {
							txt += attrTxt;
						}
					}
				}
				

				
				if(!nChild && !bkLib.inArray(this.noShort,attributeName)) {
					if(r) {
						txt += ' />';
					}
				} else {
					if(r) {
						txt += '>';
					}
					
					for(var i=0;i<n.childNodes.length;i++) {
						var results = this.toXHTML(n.childNodes[i],true,true);
						if(results) {
							txt += results;
						}
					}
				}
					
				if(r && nChild) {
					txt += '</'+nName+'>';
				}
				
				for(var i=0;i<extraNodes.length;i++) {
					txt += '</'+extraNodes[i]+'>';
				}

				break;
			case 3:
				//if(n.nodeValue != '\n') {
					txt += n.nodeValue;
				//}
				break;
		}
		
		return txt;
	}
});
nicEditors.registerPlugin(nicXHTML);



var nicBBCode = bkClass.extend({
	construct : function(nicEditor) {
		this.ne = nicEditor;
		if(this.ne.options.bbCode) {
			nicEditor.addEvent('get',this.bbGet.closure(this));
			nicEditor.addEvent('set',this.bbSet.closure(this));
			
			var loadedPlugins = this.ne.loadedPlugins;
			for(itm in loadedPlugins) {
				if(loadedPlugins[itm].toXHTML) {
					this.xhtml = loadedPlugins[itm];
				}
			}
		}
	},
	
	bbGet : function(ni) {
		var xhtml = this.xhtml.toXHTML(ni.getElm());
		ni.content = this.toBBCode(xhtml);
	},
	
	bbSet : function(ni) {
		ni.content = this.fromBBCode(ni.content);
	},
	
	toBBCode : function(xhtml) {
		function rp(r,m) {
			xhtml = xhtml.replace(r,m);
		}
		
		rp(/\n/gi,"");
		rp(/<strong>(.*?)<\/strong>/gi,"[b]$1[/b]");
		rp(/<em>(.*?)<\/em>/gi,"[i]$1[/i]");
		rp(/<span.*?style="text-decoration:underline;">(.*?)<\/span>/gi,"[u]$1[/u]");
		rp(/<ul>(.*?)<\/ul>/gi,"[list]$1[/list]");
		rp(/<li>(.*?)<\/li>/gi,"[*]$1[/*]");
		rp(/<ol>(.*?)<\/ol>/gi,"[list=1]$1[/list]");
		rp(/<img.*?src="(.*?)".*?>/gi,"[img]$1[/img]");
		rp(/<a.*?href="(.*?)".*?>(.*?)<\/a>/gi,"[url=$1]$2[/url]");
		rp(/<br.*?>/gi,"\n");
		rp(/<.*?>.*?<\/.*?>/gi,"");
		
		return xhtml;
	},
	
	fromBBCode : function(bbCode) {
		function rp(r,m) {
			bbCode = bbCode.replace(r,m);
		}		
		
		rp(/\[b\](.*?)\[\/b\]/gi,"<strong>$1</strong>");
		rp(/\[i\](.*?)\[\/i\]/gi,"<em>$1</em>");
		rp(/\[u\](.*?)\[\/u\]/gi,"<span style=\"text-decoration:underline;\">$1</span>");
		rp(/\[list\](.*?)\[\/list\]/gi,"<ul>$1</ul>");
		rp(/\[list=1\](.*?)\[\/list\]/gi,"<ol>$1</ol>");
		rp(/\[\*\](.*?)\[\/\*\]/gi,"<li>$1</li>");
		rp(/\[img\](.*?)\[\/img\]/gi,"<img src=\"$1\" />");
		rp(/\[url=(.*?)\](.*?)\[\/url\]/gi,"<a href=\"$1\">$2</a>");
		rp(/\n/gi,"<br />");
		//rp(/\[.*?\](.*?)\[\/.*?\]/gi,"$1");
		
		return bbCode;
	}

	
});
nicEditors.registerPlugin(nicBBCode);

