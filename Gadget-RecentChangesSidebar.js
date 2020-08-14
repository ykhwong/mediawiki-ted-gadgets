/*
* RecentChanges SideBar
* @author ykhwong
*/
$(function () {
	const sidebarWidth = 200;
	const minHeight = 400;
	const refreshRate = 10;
	const isMobile = ( typeof(mw.mobileFrontend) !== "undefined" );
	const isLegacyVector = ( mw.config.get("wgVectorDisableSidebarPersistence") === null );
	var rcText = "";
	var rcSidebarStyle = {
		"position": "absolute",
		"color": "black",
		"width": sidebarWidth + "px",
		"top": "0px",
		"right": "0px",
		"padding": "3px",
		"border": "solid 1px #c8ccd1"
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
		"backgroundColor": "#eaecf0",
		"width": (sidebarWidth - 4) + "px",
		"padding": "5px",
		"margin": "-4px 0px 0px -4px",
		"border": "solid 1px #c8ccd1"
	};
	var rcSidebarTabMobileStyle = {
		"position": "relative",
		"backgroundColor": "#eaecf0",
		"padding-top": "5px",
		"padding-bottom": "5px",
		"margin": "0px",
		"border-bottom": "solid 1px #c8ccd1",
		"overflow-x": "hidden !important"
	};

	if ( isMobile ) {
		$(".footer-content").append('<div id="rcSidebar"></div>');
		$("#rcSidebar").css(rcSidebarMobileStyle);
	} else {
		$("#mw-content-text").append('<div id="rcSidebar"></div>');
		$("#rcSidebar").css(rcSidebarStyle);

		if ( isLegacyVector ) {
			if (mw.config.get("wgCoordinates") !== null) {
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
		} else {
			repos();
		}
	}

	if ( localStorage['mw-recentchanges-sidebar']  !== undefined ) {
		if (localStorage['mw-recentchanges-sidebar-tab1'] !== undefined) {
			rcText = localStorage['mw-recentchanges-sidebar-tab1'];
			addRcText();
			$("#rcSidebar").append(localStorage['mw-recentchanges-sidebar']);
		}
	}
	$(".rcSidebarTab").css( isMobile ? rcSidebarTabMobileStyle : rcSidebarTabStyle );

	function addRcText() {
		$("#rcSidebar").html('<div class="rcSidebarTab" style="font-weight: bold;"><a href="/wiki/Special:RecentChanges">' + rcText + '</a></div>');
	}

	function repos() {
		if ($(".mw-workspace-container").outerWidth() < 1440) {
			$("#rcSidebar").css("margin-right", "0px");
			$("#mw-content-text").css("margin-right", (sidebarWidth + 30) + "px");
			$("#mw-content-text").css("minHeight", minHeight + "px");
			if (mw.config.get("wgCoordinates") !== null) {
				$("#rcSidebar").css("top", "43px");
			}
		} else {
			$("#rcSidebar").css("margin-right", -1 * (sidebarWidth + 90) + "px");
			$("#mw-content-text").css("margin-right", "0px");
			$("#mw-content-text").css("minHeight", "0px");
			if (mw.config.get("wgCoordinates") !== null) {
				$("#rcSidebar").css("top", "0px");
			}
		}
	}

	$.fn.isInViewport = function() {
		var elementTop = $(this).offset().top;
		var elementBottom = elementTop + $(this).outerHeight();
	
		var viewportTop = $(window).scrollTop();
		var viewportBottom = viewportTop + $(window).height();

		return elementBottom > viewportTop && elementTop < viewportBottom;
	};

	function refresh() {
		if (!$("#rcSidebar").isInViewport() || document.hidden || document.msHidden || document.webkitHidden || document.mozHidden) {
			setTimeout(function() {
				refresh();
			}, 1000);
			return;
		}
		$.get('/wiki/Special:RecentChanges?hidebots=0&hidecategorization=1&hideWikibase=1&limit=15&days=7&urlversion=2', function (data) {
			var special = $(data).find(".special");
			rcText = $(data).find("#firstHeading").text();
			if ( !/\S/.test(rcText) ) {
				rcText = $(data).find("#section_0").text();
			}
			localStorage['mw-recentchanges-sidebar-tab1'] = rcText;
			addRcText();
			$(".rcSidebarTab").css( isMobile ? rcSidebarTabMobileStyle : rcSidebarTabStyle );
			localStorage['mw-recentchanges-sidebar'] = "";
			special.children().each(function() {
				var elem = $(this);
				var targetPage = elem.find(".mw-changeslist-line-inner").data("target-page");
				var changedDate = elem.find(".mw-changeslist-date").text();
				var info = 
					'<div title="' + targetPage + '" style="display:inline-block; width: ' +
					(sidebarWidth - 40) + 'px; white-space: nowrap; overflow: hidden; vertical-align: text-top;">' +
					'<a href="/wiki/' + targetPage + '">' + targetPage + '</a></div>' +
					'<div style="display:inline-block; white-space: nowrap; padding-left: 5px; color:green; font-size:smaller; vertical-align: text-top;">' +
					changedDate + "</div>" + '<br />';
				localStorage['mw-recentchanges-sidebar'] += info;
				$("#rcSidebar").append(info);
			});
			setTimeout(function() {
				refresh();
			}, refreshRate * 1000);
		});
	}
	refresh();
	if ( !isMobile && !isLegacyVector && mw.config.get("wgNamespaceNumber") !== -1 && mw.config.get("wgAction") !== "history" ) {
		$(window).resize(function() {
			repos();
		});
	}

}());
