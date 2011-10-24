// ==UserScript==
// @name           TVCatchup Enhancer
// @namespace      http://www.networkg3.com/gmscripts
// @description    Adds various features to TVCatchup's website
// @version        0.9.8.4
// @history        0.9.8.4 Image location changed, etc
// @history        0.9.8.3 Image location changed which made the script not work, fixed
// @history        0.9.8.2 Fixed Opera's display bug, where the time was vertical
// @history        0.9.8.1 'Special Even' Bug fix
// @history        0.9.8 Bug fix for Chrome and Opera
// @history        0.9.7 Made it work with the new version of the TVGuide
// @history        0.9.6 Bug fix
// @history        0.9.5 Bug fix
// @history        0.9.4 Added red time line
// @history        0.9.3 Opera support
// @history        0.9.2 Chrome support
// @history        0.9.1 Bug fix
// @history        0.9 Initial release
// @include        http://tvcatchup.com/guide.html*
// @include        http://www.tvcatchup.com/guide.html*
// @require        http://userscripts.org/scripts/source/57756.user.js
// ==/UserScript==
(function (){

const defaultColor = '9CEF4A';
const PREFIX = "NG3_";

var prefs = [];
	prefs['timeLeft'] = {
		"DisplayName" : "Display time left:",
		"name" : "timeLeft",
		"type" : "checkbox",
		"defaultt" : true
	};
	prefs['imdbLink'] = {
		"DisplayName" : "Display IMDB link:",
		"name" : "imdbLink",
		"type" : "checkbox",
		"defaultt" : true
	};
	prefs['textColor'] = {
		"DisplayName" : "Colour of text(hex only):",
		"name" : "textColor",
		"type" : "text",
		"defaultt" : defaultColor,
		"size" : 6
	};
	prefs['redLine'] = {
		"DisplayName" : "Display red time line:",
		"name" : "redLine",
		"type" : "checkbox",
		"defaultt" : true
	};
	
if ((typeof GM_getValue == 'undefined') || (GM_getValue('a', 'b') == undefined)) {

	GM_setValue = function(name, value) {
		value = (typeof value)[0] + value;
		localStorage.setItem(PREFIX+name, value);
	}

	GM_deleteValue = function(name) {
		localStorage.removeItem(PREFIX+name);
	}

	GM_getValue = function(name, defaultValue) {
		var value = localStorage.getItem(PREFIX+name);
		var charr;
		if(!value){return defaultValue;}else{
			charr = value[0];
			value = value.substring(1);
			switch(charr){
				case 'b':
					value = (value == 'true');
					break;
				default:
					break;
			}
			return value;
		}
	}

	GM_addStyle = function(css){
		var pa= document.getElementsByTagName('head')[0] ;
		var el= document.createElement('style');
		el.type= 'text/css';
		el.media= 'screen';
		if(el.styleSheet) el.styleSheet.cssText= css;// IE method
		else el.appendChild(document.createTextNode(css));// others
		pa.appendChild(el);
	}
	
	//if it's opera, we fix the display bug
	if(window.opera) {
		var f = getElementByClass('filters');
		var parentdiv = f.parentNode;
		parentdiv.removeChild(f);
		document.getElementById('filters').appendChild(f);
	}
	
}else{
	if(typeof ScriptUpdater != 'undefined'){
		ScriptUpdater.check(84836, '0.9.8.4');
	}
}

function getElementByClass(theClass) {

	var allHTMLTags=document.body.getElementsByTagName('div');
	for (i=0; i<allHTMLTags.length; i++) {
		if (allHTMLTags[i].className==theClass) {
			return allHTMLTags[i];
		}
	}
}

function savePrefs(obj){
	var x, child;
	for(x=0;x<obj.children.length;x++){
		child = obj.children[x];
		if(child.nodeName == 'INPUT'){
			switch(child.type){
				case 'text':
					if(GM_getValue(child.id, prefs[child.id].defaultt)!=child.value){
						GM_setValue(child.id, child.value);
					}
					break;
				case 'checkbox':
					if(GM_getValue(child.id, prefs[child.id].defaultt)!=child.checked){
						GM_setValue(child.id, child.checked);
					}
					break;
				default:
					break;
			}
		}
	}
	window.location = window.location.href; //reload page
}

function printPrefs(def){
	var temp = ' ';
	var realValue, x;
	//if(prefs.length>0){
		for (x in prefs){
			realValue = GM_getValue(prefs[x].name, prefs[x].defaultt);
			temp += '<label for="'+prefs[x].name+'">'+prefs[x].DisplayName+'</label><input id="'+prefs[x].name+'" type="'+prefs[x].type+'"';
			switch(prefs[x].type){
				case 'text':
					temp += ' value="'+realValue+'" maxlength="'+ prefs[x].size +'" size="'+ prefs[x].size +'" /><br />';
					break;
				case 'checkbox':
					realValue = (realValue==true) ? 'checked="checked" ' : null;
					temp += ' value="'+prefs[x].name+'" '+realValue+'/><br />';
					break;
				default:
					temp += ' /><br />';
					break;
			}
		}
		temp += '<div id="NG3_buttons"><a id="savePrefs">Save</a> <a id="closePrefs">Close</a></div>';
	//}
	return temp;
}

function openPrefs(){
	if(!(document.getElementById('boxPrefs'))){
		var myDiv = document.createElement('div');
		myDiv.id = 'boxPrefs';
		myDiv.innerHTML = '<div id="NG3_boxPrefs" style=""><div id="NG3_header">TVCatchup Script Preferences</div><div id="NG3_main">'+printPrefs()+'</div></div>';
		document.body.appendChild(myDiv);
		
		document.getElementById('savePrefs').addEventListener("click", function (){ savePrefs(this.parentNode.parentNode); }, false);
		document.getElementById('closePrefs').addEventListener("click", function (){ closePrefs(this.parentNode.parentNode); }, false);
	}else{
		closePrefs();
	}
}

function closePrefs(){
	var prntDiv = document.body;
	var chldDiv = document.getElementById('boxPrefs');
	prntDiv.removeChild(chldDiv);
}

function ev(xpa){
	var snapLink = document.evaluate(xpa, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	if(snapLink.snapshotLength>0){
		return snapLink;
	}else{
		return null;
	}
}
function formatTime(time){
	if(time<10) time = "0" + time;
	return time;
}
/*http://blog.stevenlevithan.com/archives/faster-trim-javascript*/
function trim (str) {
	var	str = str.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}

var bTimeLeft = GM_getValue('timeLeft', prefs['timeLeft'].defaultt);
var bImdbLink = GM_getValue('imdbLink', prefs['imdbLink'].defaultt);
var bRedLine = GM_getValue('redLine', prefs['redLine'].defaultt);
var strTextColor = GM_getValue('textColor', prefs['textColor'].defaultt);

var d = new Date();

function calcWidth(){
	var timeStart = trim(document.getElementById('timeline').children[1].textContent);
	
	var timeStartS = timeStart.split(":");
	var newDate = new Date();
	newDate.setHours(parseInt(timeStartS[0], 10),parseInt(timeStartS[1], 10),0,0);
	if(newDate.getHours>d.getHours()) newDate.setDate(newDate.getDate-1);
	
	var timeBetween = new Date(d.getTime()-newDate.getTime());
	var totalmin = (timeBetween.getHours()*60) + timeBetween.getMinutes();
	
	if(totalmin<250){return (totalmin*4)+65;}
	else{return 0;}
}

GM_addStyle('#NG3_boxPrefs{color:#fff; left:10px; top:10px; position:fixed; width:auto; height:auto; padding:0 0 10px 0; background:#3B3B3B; display:block; text-align:center; border:2px solid #777; z-index:100;}\
#NG3_header{background:#777; margin:0 0 5px 0; font-weight:bold;}\
#NG3_main{text-align:left; margin:0 5px 0 5px;}\
#NG3_buttons{text-align:left;}\
#NG3_buttons a{cursor:pointer;}\
#NG3_buttons a:hover{text-decoration:underline;}\
.NG3_custlink{color:#'+strTextColor+';}\
.NG3_custlink a{color:#'+strTextColor+'; text-decoration:underline;}\
.NG3_custlink a:hover{text-decoration:none;}');

var snapPanels, z, timeLeft, timeEnd, hours, minutes, shtml, temp, title, divTemp;
var curTime = d.getTime();

if(bTimeLeft || bImdbLink || bRedLine){
	snapPanels = ev("//div[contains(@style,'images/themes/grey/guide_row_now.png')]");
	if(snapPanels!=null){
		for (z = 0; z < snapPanels.snapshotLength; z++) {
			shtml = snapPanels.snapshotItem(z);			
			if(shtml.children.length == 1) shtml = shtml.children[0];
			if(shtml.children.length == 1) shtml = shtml.children[0];
			
			if(shtml.children.length >= 5){
				divTemp = document.createElement('div');
				divTemp.setAttribute('class', 'subtitle NG3_custlink');
				
				if(bTimeLeft){
					timeEnd = shtml.children[5].textContent;
					timeLeft = (timeEnd*1000)-(curTime);
					if(timeLeft>0){
						timeLeft = new Date(timeLeft);
						hours = formatTime(timeLeft.getHours());
						minutes = formatTime(timeLeft.getMinutes());
					}else{
						hours = "00";
						minutes = "00";
					}
					divTemp.innerHTML += '[' + hours + ':' + minutes + '] ';
				}
				if(bImdbLink){
					title = encodeURIComponent(trim(shtml.children[0].textContent));
					divTemp.innerHTML += '[<a href="http://www.imdb.com/find?s=all&q=' + title + '" target="_blank">IMDB</a>]';
				}
				shtml.appendChild(divTemp);
			}
		}
		if(bRedLine){
			GM_addStyle('#NG3_redline{position:absolute; width:1px; height:100%; border-right:1px solid #FF1F1F; left:'+calcWidth()+'px; top:0;}');
			var divRedLine = document.createElement('div');
			divRedLine.id = 'NG3_redline';
			divRedLine.innerHTML = ' ';
			document.getElementById('grid').appendChild(divRedLine);
		}
	}
}

var prefsLink = document.getElementById('user');
if(prefsLink != null){
	var divPrefsLink = document.createElement('a');
	divPrefsLink.setAttribute('style', 'cursor:pointer;');
	divPrefsLink.id = 'openPrefs';
	divPrefsLink.innerHTML = ' | TVCE Options';
	prefsLink.appendChild(divPrefsLink);
	//document.getElementById('openPrefs').addEventListener("click", function (){ openPrefs(); }, false);
	divPrefsLink.addEventListener("click", function (){ openPrefs(); }, false);
}
})();