/*
* RecentChanges SideBar
* @author ykhwong
*/
$(function () {
	const sidebarWidth = 200;
	const minHeight = 400;
	const refreshRate = 10;
	const isVector = /vector/.test( mw.config.get("skin") );
	const isLegacyVector = ( $(".skin-vector-legacy").length > 0 );
	const pageViewsURI = '//wikimedia.org/api/rest_v1/metrics/pageviews/top/ko.wikipedia.org/all-access';
	var preMarginRight = $("#mw-content-text").css("margin-right");
	var preMinHeight = $("#mw-content-text").css("minHeight");
	var options = {
		autoresize : false
	};
	var msgGrp = {
		"sidebar_title" : {
			"en" : "Recent changes sidebar",
			"ko" : "최근 바뀜 사이드바"
		},
		"sidebar_desc" : {
			"en" : "Toggle recent changes sidebar",
			"ko" : "최근 바뀜 사이드바를 토글합니다"
		},
		"more" : {
			"en" : "More",
			"ko" : "더 보기"
		},
		"top_view" : {
			"en" : "Top-view",
			"ko" : "많이 본 문서"
		}
	};

	var rcText = "";
	var rcSidebarStyle = {
		"position": "absolute",
		"background-color": "white",
		"color": "black",
		"width": sidebarWidth + "px",
		"top": "0px",
		"right": "0px",
		"padding": "3px",
		"border": "solid 1px #c8ccd1",
		"border-radius": "5px 5px 0 0"
	};
	var rcSidebarMobileStyle = {
		"position": "relative",
		"color": "black",
		"top": "0px",
		"right": "0px",
		"padding": "3px",
		"overflow-x": "hidden !important"
	};
	var rcSidebarTabStyle = {
		"position": "relative",
		"background-color": "white",
		"width": (sidebarWidth - 4) + "px",
		"padding": "5px",
		"margin": "-4px 0px 0px -4px",
		"border": "solid 1px #c8ccd1",
		"border-bottom": "solid 2px #3F89F1",
		"border-radius": "5px 5px 0 0"
	};
	var rcSidebarTabMobileStyle = {
		"position": "relative",
		"background-color": "white",
		"padding-top": "5px",
		"padding-bottom": "5px",
		"margin": "0px",
		"border-bottom": "solid 1px #c8ccd1",
		"overflow-x": "hidden !important"
	};
	var pgViewSidebarSTyle = {
		"border-top": "2px solid #3F89F1",
		"padding": "4px",
		"font-size": "smaller",
		"margin-top": "5px"
	};

	if ( ! isVector ) {
		$(".footer-content").append('<div id="rcSidebar"></div>');
		$("#rcSidebar").css(rcSidebarMobileStyle);
	} else {
		$("#mw-content-text").append('<div id="rcSidebar"></div>');
		$("#rcSidebar").css(rcSidebarStyle);
	}

	function procVector() {
		if ( !isVector ) {
			return false;
		}
		if ( isLegacyVector ) {
			if ($(".mw-indicators").children().length > 0) {
				$("#rcSidebar").css("top", "43px");
			}
		}
		if ( isLegacyVector || mw.config.get("wgNamespaceNumber") === -1 || mw.config.get("wgAction") === "history" ) {
			$("#mw-content-text").css("margin-right", (sidebarWidth + 30) + "px");
			if (mw.config.get("wgCanonicalSpecialPageName") === "Search") {
				$("#rcSidebar").css("margin-right", (-1 * sidebarWidth - 30) + "px");
			} else if (/^(AbuseLog|AbuseFilter|Contributions)$/.test(mw.config.get("wgCanonicalSpecialPageName"))) {
				$("#rcSidebar").css("top", "30px");
			}
			$("#mw-content-text").css("minHeight", minHeight + "px");
		} else if ($(".vector-feature-limited-width-enabled").length === 0 || $(".mw-page-container").width() * 100 / $("body").width() > ( mw.config.get("wgNamespaceNumber") === -1 ? 75 : 90 ) ) {
			if (mw.config.get("wgCanonicalSpecialPageName") !== "Search") {
				$("#rcSidebar").css("margin-right", "0px");
			}
			$("#mw-content-text").css("margin-right", (sidebarWidth + 30) + "px");
			$("#mw-content-text").css("minHeight", minHeight + "px");
			if ($(".mw-indicators").children().length > 0) {
				$("#rcSidebar").css("top", "43px");
			}
		} else {
			$("#rcSidebar").css("margin-right", -1 * (sidebarWidth + 90) + "px");
			$("#mw-content-text").css("margin-right", "0px");
			$("#mw-content-text").css("minHeight", "0px");
			if ($(".mw-indicators").children().length > 0) {
				$("#rcSidebar").css("top", "0px");
			}
		}
	}
	procVector();

	if ( localStorage['mw-recentchanges-sidebar']  !== undefined ) {
		if (localStorage['mw-recentchanges-sidebar-tab1'] !== undefined) {
			rcText = localStorage['mw-recentchanges-sidebar-tab1'];
			addRcText();
			$("#rcSidebar").append(localStorage['mw-recentchanges-sidebar']);
		}
	}
	$(".rcSidebarTab").css( ! isVector ? rcSidebarTabMobileStyle : rcSidebarTabStyle );
	$(".mw-parser-output").css("word-wrap", "break-word");

	function getMsg(msgCode) {
		var langCode = mw.config.get( 'wgContentLanguage' );
		var result = "";
		if (!/\S/.test(langCode)) {
			langCode = "en";
		}

		if (msgGrp[msgCode]) {
			if (msgGrp[msgCode][langCode]) {
				result = msgGrp[msgCode][langCode];
			} else {
				result = msgGrp[msgCode].en;
			}
		}

		return result;
	}

	function addRcText() {
		$("#rcSidebar").html('<div class="rcSidebarTab" style="font-weight: bold;">' + rcText + '<span style="background-color: #3F89F1; border-radius: 5px; padding: 3px 5px 3px; float: right; margin-top: -2px;"><a style="font-weight: normal; color: white; text-decoration: none; font-size: 85%;" href="/wiki/Special:RecentChanges">' + getMsg('more') + '</a></span></div>');
	}

	function repos() {
		// TO-DO: Find the best portion to place the recent changes sidebar
		procVector();
	}

	$.fn.isInViewport = function() {
		var elementTop = $(this).offset().top;
		var elementBottom = elementTop + $(this).outerHeight();
	
		var viewportTop = $(window).scrollTop();
		var viewportBottom = viewportTop + $(window).height();

		return elementBottom > viewportTop && elementTop < viewportBottom;
	};

	$.fn.isOverflown = function(){
		var e=this[0];
		return e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth;
	}

	function getPageViews(info, date) {
		var retData;
		var cnt = 0;
		retData = '<div id="pgViewSidebar"><div style="font-weight: bold;">' + getMsg('top_view') + ' (' + date.year + '-' + date.month + '-' + date.day + ')</div>';
		retData += '<ol>';
		$.each( info.items[0].articles, function( i, item ) {
			if (/^(틀|위키백과|특수|도움말):/.test(item.article)) {
				return true;
			}
			cnt++;
			retData += 
			'<li><a href="/wiki/' + encodeURIComponent(item.article) + '">' +
			item.article.replace(/_/g, " ") + "</a></li>";
			if ( cnt === 10 ) {
				return false;
			}
		});
		retData += '</ol></div>';
		return retData;
	}
	
	function refresh() {
		if (!$("#rcSidebar").isInViewport() || document.hidden || document.msHidden || document.webkitHidden || document.mozHidden ||
		localStorage['mw-recentchanges-sidebar-state'] === 'hidden') {
			setTimeout(function() {
				refresh();
			}, 1000);
			return;
		}
		$.get('/wiki/Special:RecentChanges?hidebots=0&hidecategorization=1&hideWikibase=1&limit=15&days=7&urlversion=2', function (data, txtStat, req) {
			var dateObj = new Date(req.getResponseHeader('Date'));
			var svrMonth = dateObj.getMonth() + 1;
			var svrDay = dateObj.getDate() - 1;
			var svrYear = dateObj.getFullYear();
			var special = $(data).find(".special");
			rcText = $(data).find("#firstHeading").text();
			if ( !/\S/.test(rcText) ) {
				rcText = $(data).find("#section_0").text();
			}
			localStorage['mw-recentchanges-sidebar-tab1'] = rcText;
			addRcText();
			$(".rcSidebarTab").css( ! isVector ? rcSidebarTabMobileStyle : rcSidebarTabStyle );
			localStorage['mw-recentchanges-sidebar'] = "";
			special.children().each(function() {
				var elem = $(this);
				var targetPage = elem.find(".mw-changeslist-line-inner").data("target-page");
				var changedDate = elem.find(".mw-changeslist-date").text();
				var info = 
					'<div title="' + targetPage + '" style="display: inline-block; width: ' +
					(sidebarWidth - 40) + 'px; white-space: nowrap; overflow: hidden; margin-left: 2px; vertical-align: text-top;">' +
					'<a href="/wiki/' + encodeURIComponent(targetPage) + '">' + targetPage + '</a></div>' +
					'<div style="display:inline-block; white-space: nowrap; padding-left: 5px; color:black; font-size:smaller; vertical-align: text-top;">' +
					changedDate + "</div>" + '<br />';
				localStorage['mw-recentchanges-sidebar'] += info;
				$("#rcSidebar").append(info);
			});
			$.getJSON(pageViewsURI + '/' + svrYear + '/' + ("0" + svrMonth).slice(-2) + '/' + ("0" + svrDay).slice(-2)).done(function (data) {
				$("#rcSidebar").append(getPageViews(data, { month: svrMonth, day: svrDay, year: svrYear }));
				$("#pgViewSidebar").css(pgViewSidebarSTyle);
				if ( ! isVector ) {
					$("#pgViewSidebar li").css("margin-left", "20px");
				}
				setTimeout(function() { refresh(); }, refreshRate * 1000);
			}).fail(function(){
				svrDay--;
				$.getJSON(pageViewsURI + '/' + svrYear + '/' + ("0" + svrMonth).slice(-2) + '/' + ("0" + svrDay).slice(-2)).done(function (data) {
					$("#rcSidebar").append(getPageViews(data, { month: svrMonth, day: svrDay, year: svrYear }));
					$("#pgViewSidebar").css(pgViewSidebarSTyle);
					if ( ! isVector ) {
						$("#pgViewSidebar li").css("margin-left", "20px");
					}
					setTimeout(function() { refresh(); }, refreshRate * 1000);
				}).fail(function() {
					// Failed to get pageviews
					setTimeout(function() { refresh(); }, refreshRate * 1000);
				});
			});
		});
	}
	refresh();

	if ( isVector ) {
		preMarginRight = $("#mw-content-text").css("margin-right");
		preMinHeight = $("#mw-content-text").css("minHeight");
		$(window).resize(function() {
			if (!isLegacyVector) {
				if ( !options.autoresize || ( options.autoresize && $("#rcSidebar").isInViewport() )) {
					if (localStorage['mw-recentchanges-sidebar-state'] !== 'hidden') {
						repos();
					}
				}
			}
			if ( $("#rcSidebar").isInViewport() ) {
				preMarginRight = $("#mw-content-text").css("margin-right");
				preMinHeight = $("#mw-content-text").css("minHeight");
			}
		});
		$(window).scroll(function() {
			if (!options.autoresize) {
				return;
			}
			if ( !$("#rcSidebar").isInViewport() ) {
				$("#mw-content-text").css("margin-right", "0px");
				$("#mw-content-text").css("minHeight", "0px");
			} else {
				$("#mw-content-text").css("margin-right", preMarginRight);
				$("#mw-content-text").css("minHeight", preMinHeight);
				if (!isLegacyVector) {
					repos();
				}
			}
		});
		$(document).on('click', '.vector-limited-width-toggle', function () {
			window.dispatchEvent(new Event('resize'));
		});
	}

	function showSidebar() {
		localStorage['mw-recentchanges-sidebar-state'] = 'show';
		$("#mw-content-text").css("margin-right", preMarginRight);
		$("#mw-content-text").css("minHeight", preMinHeight);
		$("#rcSidebar").show();
		$(window).trigger("resize");
	}

	function hideSidebar() {
		localStorage['mw-recentchanges-sidebar-state'] = 'hidden';
		$("#mw-content-text").css("margin-right", "0px");
		$("#mw-content-text").css("minHeight", "0px");
		$("#rcSidebar").hide();
	}

	function toggleState() {
		if (localStorage['mw-recentchanges-sidebar-state'] !== 'hidden') {
			hideSidebar();
		} else {
			showSidebar();
		}
	}

	if (isVector) {
		if (localStorage['mw-recentchanges-sidebar-state'] == 'hidden') {
			hideSidebar();
		} else {
			showSidebar();
		}

		$toggle = $( '<li><a><span></span></a></li>' )
			.attr( 'id', 'ca-recentchanges' )
			.attr( 'class', 'vector-tab-noicon mw-list-item' );
		$toggle.find( 'a' )
			.attr( 'title', getMsg('sidebar_desc') ); // Toggle recent changes sidebar
		$toggle.find( 'span' )
			.text( getMsg('sidebar_title') ) // Recent changes sidebar
			.click( toggleState );
		if ( $( '#ca-nstab-special' ).length > 0 ) {
			$( '#ca-nstab-special' ).parent().append( $toggle );
		} else {
			$( '#p-views ul' ).append( $toggle );
		}
	}
}());
