/*
* RecentChanges SideBar
* @author ykhwong
*/
$(function () {
	const sidebarWidth = 200;
	var rcText = "";
	var rcSidebarStyle = {
		"position": "fixed",
		"float": "right",
		"backgroundColor": "#b5e1ff",
		"color": "black",
		"width": sidebarWidth + "px",
		"top": "200px",
		"right": "20px",
		"padding": "3px",
		"border": "solid 2px #7ec9fc"
	};
	var rcSidebarTabStyle = {
		"backgroundColor": "#7ec9fc",
		"width": "100%",
		"padding": "5px",
		"margin": "-5px -5px 3px -5px"
	};
	var rcSidebarCollapsed = false;
	if ($("#mw-sidebar-button").length === 0) {
		$("#mw-content-text").css("margin-right", (sidebarWidth + 20) + "px");
	}
	$("body").append('<div id="rcSidebar"></div>');
	$("#rcSidebar").css(rcSidebarStyle);
	if (localStorage['mw-recentchanges-sidebar']  !== undefined) {
		if (localStorage['mw-recentchanges-sidebar-tab1'] !== undefined) {
			rcText = localStorage['mw-recentchanges-sidebar-tab1'];
			$("#rcSidebar").html('<div class="rcSidebarTab"><span style="font-weight: bold;">' + rcText + '</span></div>');
			$("#rcSidebar").append(localStorage['mw-recentchanges-sidebar']);
		}
	}
	$(".rcSidebarTab").css(rcSidebarTabStyle);

	function refresh() {
		if (document.hidden || document.msHidden || document.webkitHidden || document.mozHidden) {
			setTimeout(function() {
				refresh();
			}, 1000);
			return;
		}
		$.get('/wiki/Special:RecentChanges?hidebots=0&hidecategorization=1&hideWikibase=1&limit=15&days=7&urlversion=2', function (data) {
			var special = $(data).find(".special");
			rcText = $(data).find("#firstHeading").text();
			localStorage['mw-recentchanges-sidebar-tab1'] = rcText;
			$("#rcSidebar").html('<div class="rcSidebarTab"><span style="font-weight: bold;">' + rcText + '</span></div>');
			$(".rcSidebarTab").css(rcSidebarTabStyle);
			localStorage['mw-recentchanges-sidebar'] = "";
			special.children().each(function() {
				var elem = $(this);
				var targetPage = elem.find(".mw-changeslist-line-inner").data("target-page");
				var changedDate = elem.find(".mw-changeslist-date").text();
				var info = 
					'<div title="' + targetPage + '" style="display:inline-block; width: ' + (sidebarWidth - 50) + 'px; white-space: nowrap; overflow: hidden; vertical-align: text-top;"><a href="/wiki/' + targetPage + '">' +
					targetPage + '</a></div>' +
					'&nbsp;<div style="display:inline-block; white-space: nowrap; padding-left: 5px; color:green; font-size:smaller; vertical-align: text-top;">' + changedDate + "</div>" +
					'<br />';
				localStorage['mw-recentchanges-sidebar'] += info;
				$("#rcSidebar").append(info);
			});
			setTimeout(function() {
				refresh();
			}, 10000);
		});
	}
	refresh();
	if ($("#mw-sidebar-button").length !== 0) {
		$(window).resize(function() {
			if (mw.config.get("wgNamespaceNumber") === -1) {
				if ($("body").outerWidth() > 1885) {
					if (rcSidebarCollapsed) {
						$("#rcSidebar").show();
					}
					rcSidebarCollapsed = false;
				} else {
					if (!rcSidebarCollapsed) {
						$("#rcSidebar").hide();
					}
					rcSidebarCollapsed = true;
				}
				return;
			}
			if ($(".mw-workspace-container").outerWidth() > 1358) {
				if (rcSidebarCollapsed) {
					$("#rcSidebar").show();
				}
				rcSidebarCollapsed = false;
			} else {
				if (!rcSidebarCollapsed) {
					$("#rcSidebar").hide();
				}
				rcSidebarCollapsed = true;
			}
		});
	}
}());
