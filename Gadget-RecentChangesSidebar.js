/*
* RecentChanges SideBar
* @author ykhwong
*/
$(function () {
	var rcText = "";
	const sidebarWidth = 250;
	const sidebarHeight = 350;
	if ($("#mw-sidebar-button").length === 0) {
		$("#mw-content-text").css("margin-right", (sidebarWidth + 20) + "px");
	}
	$("body").append('<div id="rcSidebar"></div>');
	$("#rcSidebar").css({
		"position": "fixed",
		"float": "right",
		"backgroundColor": "#b5e1ff",
		"color": "black",
		"width": sidebarWidth + "px",
		"height": sidebarHeight + "px",
		"top": "170px",
		"right": "20px",
		"padding": "3px",
		"border": "solid #7ec9fc"
	});
	if (localStorage['mw-recentchanges-sidebar']  !== undefined) {
		if (localStorage['mw-recentchanges-sidebar-tab1'] !== undefined) {
			rcText = localStorage['mw-recentchanges-sidebar-tab1'];
			$("#rcSidebar").html('<span style="font-weight: bold;">' + rcText + '</span><br />');
			$("#rcSidebar").append(localStorage['mw-recentchanges-sidebar']);
		}
	}

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
			$("#rcSidebar").html('<span style="font-weight: bold;">' + rcText + '</span><br />');
			localStorage['mw-recentchanges-sidebar'] = "";
			special.children().each(function() {
				var elem = $(this);
				var targetPage = elem.find(".mw-changeslist-line-inner").data("target-page");
				var changedDate = elem.find(".mw-changeslist-date").text();
				var info = 
					'<div style="display:inline-block; width: 200px; white-space: nowrap; overflow: hidden; vertical-align: text-top;"><a href="/wiki/' + targetPage + '">' +
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
}());
