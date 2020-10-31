/*
* siteNotice
* The contents of Mediawiki:Sitenotice are always exposed to search engines.
* This gadget fixes the problem.
* @author ykhwong
* Reference: https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/DismissableSiteNotice/+/master/modules/ext.dismissableSiteNotice.js
*/
var isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
var tmpSiteNotice = $("#siteNotice").html();
var cookieName = 'dismissNewSiteNotice';
var cookieData = {
	noticeData: 'newSiteNoticeData',
	dismissClicked: 'dismissClicked'
};

if (isBot) {
	$("#siteNotice").html("");
	$(".noprint").html("");
	$(".mw-jump-link").html("");
} else {
	if ((localStorage[cookieData.dismissClicked] === undefined ||
		localStorage[cookieData.dismissClicked] === "false") &&
		localStorage[cookieData.noticeData] !== undefined)
	{
		if ( $("#siteNotice").length > 0 ) {
			$("#siteNotice").html(localStorage[cookieData.noticeData]);
		}
	}
}

$(function () {
var sitenoticeId = '';
var dismissStr = "";
var noticeGrpPage = '위키백과:소도구/noticeGrp';

function html2text(html) {
	var tag = document.createElement('div');
	tag.innerHTML = html;

	return tag.innerText;
}

function getDivHtml(html, target) {
	var tag = document.createElement('div');
	tag.innerHTML = html;

	return $(tag).find(target).html();
}

function getDivText(html, target) {
	var tag = document.createElement('div');
	tag.innerHTML = html;

	return $(tag).find(target).text().trim();
}

function procDismiss() {
	$("#siteNoticeLocal").prepend('<div class="mw-dismissable-notice-close2">' +
		'<a tabindex="0" role="button"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/X-schliessen.svg/12px-X-schliessen.svg.png" title="' + dismissStr + '">' +
		'</a></div>');
	if (/\.m\.wikipedia\.org/.test(window.location.host)) {
		$("#siteNoticeLocal").css(
			{
			  'position': 'relative',
			  'padding': '12px',
			  'padding-right': '12px',
			  'padding-bottom': '15px'
			}
		);
		$(".mw-dismissable-notice-close2").css(
			{
				'position': 'relative',
				'top': '0px',
				'right': '0px',
				'margin-left': '5px',
				'text-align': 'right',
				'float': 'right'
			}
		);
	} else {
		$("#siteNoticeLocal").css(
			{
			  'padding-top': '5px',
			  'padding-bottom': '5px',
			  'margin-bottom': '5px'
			}
		);
		$(".mw-dismissable-notice-close2").css(
			{
				'position': 'relative',
				'top': '0px',
				'right': '7px',
				'margin-left': '5px',
				'text-align': 'right',
				'float': 'right'
			}
		);
	}

	$( '.mw-dismissable-notice-close2' )
		.css( 'visibility', 'visible' )
		.find( 'a' )
		.on( 'click keypress', function ( e ) {
			if (
				e.type === 'click' ||
				e.type === 'keypress' && e.which === 13
			) {
				$("#siteNoticeLocal").hide();
				$.cookie( cookieName, sitenoticeId, {
					expires: 30,
					path: '/'
				} );
				localStorage[cookieData.dismissClicked] = true;
			}
		});

	localStorage[cookieData.noticeData] = $("#siteNotice").html();
}

if (isBot) {
	return;
}

var api = new mw.Api();
api.parse(
    new mw.Title( noticeGrpPage )
).then( function( html ) {
	var gadgetSiteNotice = "";
	var gadgetAnonnotice = "";
	html = html.replace("mw-parser-output", "mw-dismissable-notice");
	gadgetSiteNotice = getDivHtml(html, "#gadgetSiteNotice");
	gadgetAnonnotice = getDivHtml(html, "#gadgetAnonnotice");
	sitenoticeId = getDivText(html, "#sitenoticeId");
	dismissStr = getDivText(html, "#dismissLabel"); 

	if (mw.config.get('wgUserName') !== null) {
		if(/\S/.test(html2text(gadgetSiteNotice).trim())) {
			// If the user has the notice dismissal cookie set, exit.
			if ( $.cookie( cookieName ) !== sitenoticeId ) {
				localStorage[cookieData.dismissClicked] = false;
				$("#siteNotice").html(tmpSiteNotice);
				$("#siteNotice").append('<div id="siteNoticeLocal">' + gadgetSiteNotice + '</div>');
				procDismiss();
			}
		} else {
			$("#siteNotice").html(tmpSiteNotice);
			localStorage[cookieData.noticeData] = $("#siteNotice").html();
		}
		return;
	}
	if (html2text(gadgetAnonnotice).trim().length === 0) {
		$("#siteNotice").html(tmpSiteNotice);
		localStorage[cookieData.noticeData] = $("#siteNotice").html();
		return;
	} else if (/^\s*-\s*$/.test(html2text(gadgetAnonnotice).trim())) {
		if(/\S/.test(html2text(gadgetSiteNotice).trim())) {
			// If the user has the notice dismissal cookie set, exit.
			if ( $.cookie( cookieName ) !== sitenoticeId ) {
				localStorage[cookieData.dismissClicked] = false;
				$("#siteNotice").html(tmpSiteNotice);
				$("#siteNotice").append('<div id="siteNoticeLocal">' + gadgetSiteNotice + '</div>');
				procDismiss();
				return;
			}
		}
	} else {
		localStorage[cookieData.dismissClicked] = false;
		$("#siteNotice").html(tmpSiteNotice);
		$("#siteNotice").append('<div id="siteNoticeLocal">' + gadgetAnonnotice + '</div>');
		procDismiss();
		return;
	}
});

}());
