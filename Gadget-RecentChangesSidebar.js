/*
* RecentChanges SideBar
* @author ykhwong
*/
/*jshint esversion: 6 */
$(function () {
	var langCode = mw.config.get( 'wgContentLanguage' );
	var timeoutIds = [];
	var options = {};
	var messages = {};
	var preMarginRight = $("#mw-content-text").css("margin-right");
	var preMinHeight = $("#mw-content-text").css("min-height");
	const sidebarWidth = 190;
	const minHeight = 400;
	const refreshRate = 10;
	const isVector = /vector/.test( mw.config.get("skin") );
	const isMinerva = /minerva/.test( mw.config.get("skin") );
	const isLegacyVector = ( $(".skin-vector-legacy").length > 0 );
	const pageViewsURI = '//wikimedia.org/api/rest_v1/metrics/pageviews/top/' + langCode + '.wikipedia.org/all-access';
	const recentChangesURI = '/wiki/Special:RecentChanges?hidecategorization=1&hideWikibase=1&limit=15&days=7&urlversion=2';
	const recentChangesWithWdURI = '/wiki/Special:RecentChanges?hidecategorization=1&hideWikibase=0&limit=15&days=7&urlversion=2';
	var msgGrp = {
		'sidebar_title' : {
			'en' : 'Recent changes sidebar',
			'ko' : '최근 바뀜 사이드바'
		},
		'sidebar_desc' : {
			'en' : 'Toggle recent changes sidebar',
			'ko' : '최근 바뀜 사이드바를 토글합니다'
		},
		'more' : {
			'en' : 'More',
			'ko' : '더 보기'
		},
		'top_view' : {
			'en' : 'Top-view',
			'ko' : '많이 본 문서'
		},
		'inc_wd' : {
			'en' : 'Inc. WD',
			'ko' : 'WD 포함'
		}
	};

	var rcText = "";
	var rcSidebarStyle = {
		'position': 'absolute',
		'background-color': 'white',
		'color': 'black',
		'width': sidebarWidth + 'px',
		'top': '0px',
		'right': '0px',
		'padding': '3px',
		'border': 'solid 1px #c8ccd1',
		'border-radius': '5px 5px 0 0',
		'font-size': $('#mw-content-text').css('font-size'),
		'line-height': $('#mw-content-text').css('line-height')
	};
	var rcSidebarMobileStyle = {
		'position': 'relative',
		'color': 'black',
		'top': '0px',
		'right': '0px',
		'padding': '3px',
		'overflow-x': 'hidden !important'
	};
	var rcSidebarTabStyle = {
		'position': 'relative',
		'background-color': 'white',
		'width': (sidebarWidth - 4) + 'px',
		'padding': '5px',
		'margin': '-4px 0px 0px -4px',
		'border': 'solid 1px #c8ccd1',
		'border-bottom': 'solid 2px #3F89F1',
		'border-radius': '5px 5px 0 0'
	};
	var rcSidebarTabMobileStyle = {
		'position': 'relative',
		'background-color': 'white',
		'padding-top': '5px',
		'padding-bottom': '5px',
		'margin': '0px',
		'border-bottom': 'solid 1px #c8ccd1',
		'overflow-x': 'hidden !important'
	};
	var pgViewSidebarSTyle = {
		'border-top': '2px solid #3F89F1',
		'padding': '4px',
		'font-size': 'smaller',
		'margin-top': '5px'
	};

	$.fn.isInViewport = function() {
		if ( $(this).length === 0 ) {
			return false;
		}
		var elementTop = $(this).offset().top;
		var elementBottom = elementTop + $(this).outerHeight();
		var viewportTop = $(window).scrollTop();
		var viewportBottom = viewportTop + $(window).height();

		return elementBottom > viewportTop && elementTop < viewportBottom;
	};

	function init() {
		var isInited = false;
		if ( $("#rcSidebar").length > 0 ) {
			return false;
		}
		if ( window.rc_sidebar !== undefined ) {
			if ( window.rc_sidebar.config !== undefined ) {
				options = window.rc_sidebar.config;
			}
			if ( window.rc_sidebar.messages !== undefined ) {
				messages = window.rc_sidebar.messages;
			}
		}
		
		if ( options.enabled !== undefined ) {
			if ( ! options.enabled ) {
				return false;
			}
		}

		if ( isMinerva ) {
			$(".footer-content").append('<div id="rcSidebar"></div>');
			$("#rcSidebar").css(rcSidebarMobileStyle);
			isInited = true;
		} else if ( isVector ) {
			$("#mw-content-text").append('<div id="rcSidebar"></div>');
			$("#rcSidebar").css(rcSidebarStyle);
			isInited = true;
		}
		return isInited;
	}

	function procVector() {
		if ( !isVector ) {
			return false;
		}

		if ( isLegacyVector ) {
			if ($(".mw-indicators").children().length > 0) {
				$("#rcSidebar").css("top", "43px");
			}

			$("#mw-content-text").css("margin-right", (sidebarWidth + 30) + "px");
			$('#catlinks').css('margin-right', (sidebarWidth + 30) + 'px');
			if (mw.config.get("wgCanonicalSpecialPageName") === "Search") {
				$("#rcSidebar").css("margin-right", (-1 * sidebarWidth - 30) + "px");
			} else if (/^(AbuseLog|AbuseFilter|Contributions)$/.test(mw.config.get("wgCanonicalSpecialPageName"))) {
				$("#rcSidebar").css("top", "30px");
			}
			$("#mw-content-text").css("min-height", minHeight + "px");
		} else {
			var greyWidth = ( $("body").width() - ( $(".mw-page-container").width() + parseFloat($(".mw-page-container").css("padding-right")) + parseFloat($(".mw-page-container").css("padding-left")) ) ) / 2;
			var ns = mw.config.get( 'wgNamespaceNumber' );
			if ( ns === 14 || ns === -1 || mw.config.get("wgAction") === "history" || mw.config.get("wgAction") === "edit" || mw.config.get("wgDiffOldId") !== null ) {
				if (greyWidth - 30 < sidebarWidth) {
					if (mw.config.get("wgCanonicalSpecialPageName") === "Search") {
						$("#rcSidebar").css("margin-right", -1 * (sidebarWidth + 30) + "px");
					} else {
						$("#rcSidebar").css("margin-right", 0);
					}
					$("#mw-content-text").css({
						'margin-right': (sidebarWidth + 30) + 'px',
						'min-height': minHeight + 'px'
					});
					$('#catlinks').css('margin-right', (sidebarWidth + 30) + 'px');
					if ($(".mw-indicators").children().length > 0) {
						$("#rcSidebar").css("top", "43px");
					}
				} else {
					$("#rcSidebar").css("margin-right", -1 * (sidebarWidth + 90) + "px");
					$("#mw-content-text").css({
						'margin-right': 0,
						'min-height': 0
					});
					$('#catlinks').css('margin-right', 0);
					if ($(".mw-indicators").children().length > 0) {
						$("#rcSidebar").css("top", 0);
					}
				}
			} else {
				if ($(".vector-feature-limited-width-enabled").length === 0 || $(".mw-page-container").width() * 100 / $("body").width() > 90 ) {
					if (mw.config.get("wgCanonicalSpecialPageName") === "Search") {
						$("#rcSidebar").css("margin-right", -1 * (sidebarWidth + 30) + "px");
					} else {
						$("#rcSidebar").css("margin-right", 0);
					}
					$("#mw-content-text").css({
						'margin-right': (sidebarWidth + 30) + 'px',
						'min-height': minHeight + 'px'
					});
					$('#catlinks').css('margin-right', (sidebarWidth + 30) + 'px');
					if ($(".mw-indicators").children().length > 0) {
						$("#rcSidebar").css("top", "43px");
					}
				} else {
					$("#rcSidebar").css("margin-right", -1 * (sidebarWidth + 30) + "px");
					$("#mw-content-text").css({
						'margin-right': 0,
						'min-height': 0
					});
					$('#catlinks').css('margin-right', 0);
					if ($(".mw-indicators").children().length > 0) {
						$("#rcSidebar").css("top", 0);
					}
				}
			}
		}
	}

	function getMsg(msgCode) {
		var result = "";

		if ( messages[msgCode] !== undefined ) {
			return messages[msgCode];
		}

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
		$("#rcSidebar").html(
			'<div class="rcSidebarTab" style="font-weight: bold;">' + rcText +
			'<span style="background-color: #3F89F1; border-radius: 5px; padding: 3px 5px 3px; float: right; margin-top: -2px;">' +
			'<a style="font-weight: normal; color: white; text-decoration: none; font-size: 85%;" href="/wiki/Special:RecentChanges">' +
			getMsg('more') +
			'</a></span></div>'
		);
	}

	function getPageViews(info, date) {
		var retData;
		var cnt = 0;
		retData = '<div id="pgViewSidebar"><div style="font-weight: bold;">' + getMsg('top_view') + ' (' + date.year + '-' + date.month + '-' + date.day + ')</div>';
		retData += '<ol>';
		var ignore = false;
		localStorage['mw-recentchanges-sidebar-pageviews'] = '';
		$.each( info.items[0].articles, function( i, item ) {
			ignore = false;
			var nsgrp = mw.config.get('wgFormattedNamespaces');
			for ( var i2 = 1; i2 < Object.keys(nsgrp).length; i2++ ) {
				if ( item.article.startsWith(nsgrp[Object.keys(nsgrp)[i2]] + ':') ) {
					ignore = true;
					break;
				}
			}
			if (ignore) {
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
		localStorage['mw-recentchanges-sidebar-pageviews'] += retData;
		localStorage['mw-recentchanges-sidebar-pageviews-year'] = date.year;
		localStorage['mw-recentchanges-sidebar-pageviews-month'] = date.month;
		localStorage['mw-recentchanges-sidebar-pageviews-day'] = date.day;
		return retData;
	}

	function clearAllTimeout() {
		for (var i = 0; i < timeoutIds.length; i++) {
			clearTimeout(i);
		}
		timeoutIds = [];
	}

	function getPrevDate(svrYear, svrMonth, svrDay) {
		var tmpDateStr = svrYear + "-" + ("0" + svrMonth).slice(-2) + "-" + ("0" + svrDay).slice(-2);
		var newDateStr = '';
		var tmpDate = new Date(tmpDateStr);
		var result = {};
		tmpDate.setDate(tmpDate.getDate() - 1);
		newDateStr = tmpDate.toISOString().split('T')[0];
		svrYear = newDateStr.split('-')[0];
		svrMonth = newDateStr.split('-')[1];
		svrDay = newDateStr.split('-')[2];
		result = {
			year: svrYear,
			month: svrMonth,
			day: svrDay
		};
		return result;
	}

	function autoRefresh() {
		var rcURI;
		if (!$("#rcSidebar").isInViewport() || document.hidden || document.msHidden || document.webkitHidden || document.mozHidden ||
		localStorage['mw-recentchanges-sidebar-state'] === 'hidden') {
			timeoutIds.push(setTimeout(function() { autoRefresh(); }, 1000));
			return;
		}
		clearAllTimeout();

		if ( localStorage['mw-recentchanges-sidebar-incWD'] === 'enabled' ) {
			rcURI = recentChangesWithWdURI;
		} else {
			rcURI = recentChangesURI;
		}
		if ( options.params !== undefined && options.params.length > 0 ) {
			for ( var i = 0; i < options.params.length; i++ ) {
				var param = options.params[i].trim();
				if ( !/(\S)=(\S)/.test(param) ) {
					continue;
				}
				rcURI += '&' + param;
			}
		}
		if ( !/&hidebots=/i.test(rcURI) ) {
			rcURI += '&hidebots=0';
		}

		$.get(rcURI, function (data, txtStat, req) {
			var dateObj = new Date(req.getResponseHeader('Date'));
			var svrMonth = dateObj.getMonth() + 1;
			var svrDay = dateObj.getDate();
			var svrYear = dateObj.getFullYear();
			var special = $(data).find(".special");
			var usePageViewsCache = false;
			var prevDate = getPrevDate(svrYear, svrMonth, svrDay);
			svrYear = prevDate.year;
			svrMonth = prevDate.month;
			svrDay = prevDate.day;

			// Add recent changes info
			rcText = $(data).find("#firstHeading").text();
			if ( !/\S/.test(rcText) ) {
				rcText = $(data).find("#section_0").text();
			}
			localStorage['mw-recentchanges-sidebar-tab1'] = rcText;
			addRcText();
			$(".rcSidebarTab").css( isMinerva ? rcSidebarTabMobileStyle : rcSidebarTabStyle );
			localStorage['mw-recentchanges-sidebar'] = "";
			special.children().each(function() {
				var elem = $(this);
				var targetPage = $(elem.find(".mw-title")[0]).text();
				var changedDate = elem.find(".mw-changeslist-date").text();
				var diffLink = $(elem.find(".mw-changeslist-links > span > a:first")[0]).attr('href') || $(elem.find(".extiw")[0]).attr('href');
				var info;
				if ( ! /&diff=/.test(diffLink) ) {
					diffLink = '#';
				}
				if ( !targetPage || ! /\S/.test(targetPage) ) {
					targetPage = elem.find(".mw-changeslist-line-inner").data("target-page");
					if ( !targetPage || ! /\S/.test(targetPage) ) {
						targetPage = '';
					}
				}

				info = 
					'<div title="' + targetPage + '" style="display: inline-block; width: ' +
					(sidebarWidth - 40) + 'px; white-space: nowrap; overflow: hidden; margin-left: 2px; vertical-align: text-top;">' +
					'<a href="/wiki/' + encodeURIComponent(targetPage) + '">' + targetPage + '</a></div>' +
					'<div style="display:inline-block; white-space: nowrap; padding-left: 5px; color:black; font-size:smaller; vertical-align: text-top;">' +
					'<a style="color: black;" href=' + diffLink + '>' + changedDate + "</a></div>" + '<br />';
				localStorage['mw-recentchanges-sidebar'] += info;
				$("#rcSidebar").append(info);
			});
			$("#rcSidebar").append('<div style="text-align: right; padding-right: 3px;"><label><input type="checkbox" id="rcSidebar-incWD">&nbsp;' + getMsg('inc_wd') + '</label></div>');

			if ( localStorage['mw-recentchanges-sidebar-incWD'] === 'enabled' ) {
				$("#rcSidebar-incWD").prop('checked', true);
			} else {
				$("#rcSidebar-incWD").prop('checked', false);
			}

			$("#rcSidebar-incWD").change(function() {
				if (!this.checked) {
					localStorage['mw-recentchanges-sidebar-incWD'] = 'disabled';
				} else {
					localStorage['mw-recentchanges-sidebar-incWD'] = 'enabled';
				}
				timeoutIds.push(setTimeout(function() { autoRefresh(); }, 1000));
			});

			// Add page views
			if ( options.enabled !== undefined ) {
				if ( ! options.top_view ) {
					return;
				}
			}
			if ( localStorage['mw-recentchanges-sidebar-pageviews-year']  !== undefined ) {
				if ( localStorage['mw-recentchanges-sidebar-pageviews-month']  !== undefined ) {
					if ( localStorage['mw-recentchanges-sidebar-pageviews-year']  !== undefined ) {
						$("#rcSidebar").append(localStorage['mw-recentchanges-sidebar-pageviews']);
						$("#pgViewSidebar").css(pgViewSidebarSTyle);
						if ( isMinerva ) {
							$("#pgViewSidebar li").css("margin-left", "20px");
						}
						if ( svrYear.toString() === localStorage['mw-recentchanges-sidebar-pageviews-year'] &&
						     svrMonth.toString() === localStorage['mw-recentchanges-sidebar-pageviews-month'] &&
						     svrDay.toString() === localStorage['mw-recentchanges-sidebar-pageviews-day']
						) {
							usePageViewsCache = true;
						}
					}
				}
			}

			if (usePageViewsCache) {
				timeoutIds.push(setTimeout(function() { autoRefresh(); }, refreshRate * 1000));
			} else {
				$.getJSON(pageViewsURI + '/' + svrYear + '/' + ("0" + svrMonth).slice(-2) + '/' + ("0" + svrDay).slice(-2)).done(function (data) {
					$("#pgViewSidebar").remove();
					$("#rcSidebar").append(getPageViews(data, { month: svrMonth, day: svrDay, year: svrYear }));
					$("#pgViewSidebar").css(pgViewSidebarSTyle);
					if ( isMinerva ) {
						$("#pgViewSidebar li").css("margin-left", "20px");
					}
					timeoutIds.push(setTimeout(function() { autoRefresh(); }, refreshRate * 1000));
				}).fail(function(){
					prevDate = getPrevDate(svrYear, svrMonth, svrDay);
					svrYear = prevDate.year;
					svrMonth = prevDate.month;
					svrDay = prevDate.day;
					$.getJSON(pageViewsURI + '/' + svrYear + '/' + ("0" + svrMonth).slice(-2) + '/' + ("0" + svrDay).slice(-2)).done(function (data) {
						$("#pgViewSidebar").remove();
						$("#rcSidebar").append(getPageViews(data, { month: svrMonth, day: svrDay, year: svrYear }));
						$("#pgViewSidebar").css(pgViewSidebarSTyle);
						if ( isMinerva ) {
							$("#pgViewSidebar li").css("margin-left", "20px");
						}
						timeoutIds.push(setTimeout(function() { autoRefresh(); }, refreshRate * 1000));
					}).fail(function() {
						// Failed to get pageviews
						timeoutIds.push(setTimeout(function() { autoRefresh(); }, refreshRate * 1000));
					});
				});
			}
		});
	}

	function showSidebar() {
		localStorage['mw-recentchanges-sidebar-state'] = 'show';
		$("#mw-content-text").css({
			"margin-right": preMarginRight,
			"min-height": preMinHeight
		});
		$('#catlinks').css('margin-right', preMarginRight);
		$("#rcSidebar").show();
		$(window).trigger("resize");
	}

	function hideSidebar() {
		localStorage['mw-recentchanges-sidebar-state'] = 'hidden';
		$("#mw-content-text").css({
			"margin-right": 0,
			"min-height": 0
		});
		$('#catlinks').css('margin-right', 0);
		$("#rcSidebar").hide();
	}

	function initSidebar() {
		$(window).trigger("resize");
		if (localStorage['mw-recentchanges-sidebar-state'] === 'hidden') {
			hideSidebar();
		} else {
			showSidebar();
		}
	}

	function toggleSidebar() {
		if (localStorage['mw-recentchanges-sidebar-state'] !== 'hidden') {
			hideSidebar();
		} else {
			showSidebar();
		}
	}

	function loadCache() {
		if ( localStorage['mw-recentchanges-sidebar-incWD'] === undefined ) {
			localStorage['mw-recentchanges-sidebar-incWD'] = 'enabled';
		}

		if ( localStorage['mw-recentchanges-sidebar']  !== undefined ) {
			if (localStorage['mw-recentchanges-sidebar-tab1'] !== undefined) {
				rcText = localStorage['mw-recentchanges-sidebar-tab1'];
				addRcText();
				$("#rcSidebar").append(localStorage['mw-recentchanges-sidebar']);
				$("#rcSidebar").append('<div style="text-align: right; padding-right: 3px;"><label><input type="checkbox" id="rcSidebar-incWD">&nbsp;' + getMsg('inc_wd') + '</label></div>');
				if ( localStorage['mw-recentchanges-sidebar-incWD'] === 'enabled' ) {
					$("#rcSidebar-incWD").prop('checked', true);
				}
				$("#rcSidebar-incWD").attr("disabled", "disabled").off('click');
			}
		}
		$(".rcSidebarTab").css( isMinerva ? rcSidebarTabMobileStyle : rcSidebarTabStyle );
		$(".mw-parser-output").css("word-wrap", "break-word");

		if ( localStorage['mw-recentchanges-sidebar-pageviews']  !== undefined ) {
			$("#rcSidebar").append(localStorage['mw-recentchanges-sidebar-pageviews']);
			$("#pgViewSidebar").css(pgViewSidebarSTyle);
			if ( isMinerva ) {
				$("#pgViewSidebar li").css("margin-left", "20px");
			}
		}
	}

	function main() {
		if ( !init() ) {
			return;
		}

		procVector();
		loadCache();
		autoRefresh();

		if ( ! isVector ) {
			return;
		}

		preMarginRight = $("#mw-content-text").css("margin-right");
		preMinHeight = $("#mw-content-text").css("min-height");

		$(window).resize(function() {
			if (isVector && !isLegacyVector) {
				if (localStorage['mw-recentchanges-sidebar-state'] !== 'hidden') {
					procVector();
				}
			}
			if ( $("#rcSidebar").isInViewport() ) {
				preMarginRight = $("#mw-content-text").css("margin-right");
				preMinHeight = $("#mw-content-text").css("min-height");
			}

			if (
				$(".vector-column-end").length > 0 &&
				$(".vector-column-end").has("#vector-page-tools").length > 0 &&
				$(".vector-page-tools-landmark #vector-page-tools-pinned-container").length > 0
			) {
				$('#vector-page-tools').append($("#rcSidebar"));
				$("#rcSidebar").css({
					'position': 'auto',
					'top': 'auto',
					'right': 'auto',
					'width': '190px'
				});
				$("#mw-content-text").css({
					'margin-right': 'auto'
				});
				$('#vector-page-tools').css('width', '230px')
				if ( $(".vector-pinnable-header-unpin-button, .vector-pinnable-header-pin-button").attr('data-event-name') === 'pinnable-header.vector-main-menu.pin' ) {
					$('#rcSidebar').css('position', 'static');
				} else if ( $(".vector-pinnable-header-unpin-button, .vector-pinnable-header-pin-button").attr('data-event-name') === 'pinnable-header.vector-main-menu.unpin' ) {
					$('#rcSidebar').css('position', 'absolute');
				}
			} else {
				if ( isMinerva ) {
					$(".footer-content").append($("#rcSidebar"));
					$("#rcSidebar").css(rcSidebarMobileStyle);
				} else if ( isVector ) {
					$("#mw-content-text").append($("#rcSidebar"));
					$("#rcSidebar").css(rcSidebarStyle);
				}
			}
		});

		$(".vector-pinnable-header-unpin-button, .vector-pinnable-header-pin-button").click(function() {
			if ( $(this).attr('data-event-name') === 'pinnable-header.vector-page-tools.unpin' ||
			$(this).attr('data-event-name') === 'pinnable-header.vector-page-tools.pin'
			) {
				setTimeout(function() { $(window).trigger('resize'); }, 150);
			}
		});


		$(document).on('click', '.vector-limited-width-toggle', function () {
			$(window).trigger("resize");
		});

		initSidebar();

		$toggle = $( '<li><a><span></span></a></li>' )
			.attr( 'id', 'ca-recentchanges' )
			.attr( 'class', 'vector-tab-noicon mw-list-item' );
		$toggle.find( 'a' )
			.attr( 'title', getMsg('sidebar_desc') ); // Toggle recent changes sidebar
		$toggle.find( 'span' )
			.text( getMsg('sidebar_title') ) // Recent changes sidebar
			.click( toggleSidebar );
		if ( $( '#ca-nstab-special' ).length > 0 ) {
			$( '#ca-nstab-special' ).parent().append( $toggle );
		} else {
			$( '#p-views ul' ).append( $toggle );
		}
	}

	main();
}());
