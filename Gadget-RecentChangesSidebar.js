/*
* RecentChanges SideBar
* @author ykhwong
*/
$(function () {
	const rcText = "최근 바뀜";
	if ($("#mw-sidebar-button").length === 0) {
		$("#mw-content-text").css("margin-right", "270px");
	}
	$("body").append('<div id="rcSidebar"></div>');
	$("#rcSidebar").css({
		"position": "fixed",
		"float": "right",
		"backgroundColor": "#b5e1ff",
		"color": "black",
		"width": "250px",
		"height": "500px",
		"top": "170px",
		"right": "20px",
		"padding": "3px",
		"border": "solid #7ec9fc"
	});
	$("#rcSidebar").html('<span style="font-weight: bold;">' + rcText + '</span><br />');
	if (localStorage['mw-recentchanges-sidebar']  !== undefined) {
		$("#rcSidebar").append(localStorage['mw-recentchanges-sidebar']);
	}

	function refresh() {
		if (document.hidden || document.msHidden || document.webkitHidden || document.mozHidden) {
			setTimeout(function() {
				refresh();
			}, 1000);
			return;
		}
		$.get('/wiki/%ED%8A%B9%EC%88%98:%EC%B5%9C%EA%B7%BC%EB%B0%94%EB%80%9C?hidebots=0&hidecategorization=0&hideWikibase=1&limit=15&days=7&urlversion=2', function (data) {
			var special = $(data).find(".special");
			$("#rcSidebar").html('<span style="font-weight: bold;">' + rcText + '</span><br />');
			special.children().each(function() {
				var elem = $(this);
				var targetPage = elem.find(".mw-changeslist-line-inner").data("target-page");
				var changedDate = elem.find(".mw-changeslist-date").text();
				var info = 
					'<a href="/wiki/' + targetPage + '">' +
					targetPage + '</a>' +
					'&nbsp;<span style="color:green; font-size:smaller;">' + changedDate + "</span>" +
					"<br />";
				localStorage['mw-recentchanges-sidebar'] = info;
				$("#rcSidebar").append(info);
			});
			setTimeout(function() {
				refresh();
			}, 10000);
		});
	}
	refresh();
}());
