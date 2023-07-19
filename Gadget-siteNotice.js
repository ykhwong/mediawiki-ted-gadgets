/*
* siteNotice
* The contents of Mediawiki:Sitenotice are always exposed to search engines.
* This gadget fixes the problem.
* @author ykhwong
* Reference: https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/DismissableSiteNotice/+/master/modules/ext.dismissableSiteNotice.js
*/
/*jshint esversion: 6 */
const noticeGrpPage = '틀:소도구/noticeGrp';
const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);
const isMobile = /\.m\.wikipedia\.org/.test(window.location.host);
var tmpSiteNotice = "";
var cookieName = 'dismissNewSiteNotice';
var cookieData = {
	noticeData: 'newSiteNoticeData',
	dismissClicked: 'dismissClicked'
};

function procCache() {
	if ((mw.storage.get( cookieData.dismissClicked ) === undefined ||
		mw.storage.get( cookieData.dismissClicked ) === "false") &&
		mw.storage.get( cookieData.noticeData ) !== undefined)
	{
		if ( $("#siteNotice").length > 0 ) {
			tmpSiteNotice = $("#siteNotice").html();
			$("#siteNotice").html(mw.storage.get( cookieData.noticeData ));
		}
	}
}

if (isBot) {
	$("#siteNotice").html("");
	$(".noprint").html("");
	$(".mw-jump-link").html("");
} else {
	/*
	if (!isMobile) {
		procCache();
	}
	*/
}

$(function () {
var sitenoticeId = '';
var dismissStr = '';
var sitenoticeStyle = '';

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
		'<a tabindex="0" role="button"><img style="display: block; opacity: 0.55; width: 17px; margin-left: 2px; margin-bottom: 2px;" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22%3E%3Ctitle%3Eclose%3C/title%3E%3Cpath d=%22M4.34 2.93l12.73 12.73-1.41 1.41L2.93 4.35z%22/%3E%3Cpath d=%22M17.07 4.34L4.34 17.07l-1.41-1.41L15.66 1.93z%22/%3E%3C/svg%3E" title="' + dismissStr + '">' +
		'</a></div>');
	if (isMobile) {
		$("#siteNoticeLocal").css(
			{
			  'position': 'relative',
			  'padding-left': $("#siteNoticeLocal").css('padding-left') === '0px' ? '12px' : $("#siteNoticeLocal").css('padding-left'),
			  'padding-top': $("#siteNoticeLocal").css('padding-top') === '0px' ? '12px' : $("#siteNoticeLocal").css('padding-top'),
			  'padding-right': $("#siteNoticeLocal").css('padding-right') === '0px' ? '12px' : $("#siteNoticeLocal").css('padding-right'),
			  'padding-bottom': $("#siteNoticeLocal").css('padding-bottom') === '0px' ? '15px' : $("#siteNoticeLocal").css('padding-bottom'),
			}
		);
		$(".mw-dismissable-notice-close2").css(
			{
				'position': 'relative',
				'top': '0px',
				'right': '0px',
				'padding-left': '5px',
				'text-align': 'right',
				'float': 'right'
			}
		);
	} else {
		$("#siteNoticeLocal").css(
			{
			  'padding-top': '5px',
			  'padding-bottom': '5px',
			  'margin-bottom': '15px'
			}
		);
		$(".mw-dismissable-notice-close2").css(
			{
				'position': 'relative',
				'top': '0px',
				'right': '7px',
				'padding-left': '5px',
				'text-align': 'right',
				'float': 'right'
			}
		);
	}
	$("#siteNoticeLocal ul").css({
		"list-style": "none",
		"text-align": "left",
		"display": "table",
		"margin": "0 auto",
		"padding-left": "10px",
		"max-width": "calc(100% - 20px)"
	});

	$( '.mw-dismissable-notice-close2' )
		.css( 'visibility', 'visible' )
		.find( 'a' )
		.on( 'click keypress', function ( e ) {
			if (
				e.type === 'click' ||
				e.type === 'keypress' && e.which === 13
			) {
				$("#siteNoticeLocal").hide();
				mw.loader.using('mediawiki.cookie').then(function () {
					mw.cookie.set( cookieName, sitenoticeId, {
						path: '/'
					} );
				});
				mw.storage.set( cookieData.dismissClicked, "true" );
			}
		});

	mw.storage.set( cookieData.noticeData, $("#siteNotice").html() );
}

function procApi() {
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
		sitenoticeStyle = getDivText(html, "#sitenoticeStyle");
	
		if (/\S/.test(tmpSiteNotice)) {
			$("#siteNotice").html(tmpSiteNotice);
		}

		if (mw.config.get('wgUserName') !== null) {
			if(/\S/.test(html2text(gadgetSiteNotice).trim())) {
				// If the user has the notice dismissal cookie set, exit.
				mw.loader.using('mediawiki.cookie').then(function () {
					if ( mw.cookie.get( cookieName ) !== sitenoticeId ) {
						mw.storage.set( cookieData.dismissClicked, "false" );
						$("#siteNotice").append('<div id="siteNoticeLocal" style="' + sitenoticeStyle + '">' + gadgetSiteNotice + '</div>');
						procDismiss();
					}
				});
			} else {
				mw.storage.set( cookieData.noticeData, tmpSiteNotice );
			}
			return;
		}

		mw.storage.set( cookieData.noticeData, tmpSiteNotice );
		if (html2text(gadgetAnonnotice).trim().length === 0) {
			return;
		} else if (/^\s*-\s*$/.test(html2text(gadgetAnonnotice).trim())) {
			if(/\S/.test(html2text(gadgetSiteNotice).trim())) {
				// If the user has the notice dismissal cookie set, exit.
				mw.loader.using('mediawiki.cookie').then(function () {
					if ( mw.cookie.get( cookieName ) !== sitenoticeId ) {
						mw.storage.set( cookieData.dismissClicked, "false" );
						$("#siteNotice").append('<div id="siteNoticeLocal" style="' + sitenoticeStyle + '">' + gadgetSiteNotice + '</div>');
						procDismiss();
						return;
					} else {
						return;
					}
				});
			}
		} else {
			mw.storage.set( cookieData.dismissClicked, "false" );
			$("#siteNotice").append('<div id="siteNoticeLocal" style="' + sitenoticeStyle + '">' + gadgetAnonnotice + '</div>');
			procDismiss();
			return;
		}
	});
}

procApi();

}());
