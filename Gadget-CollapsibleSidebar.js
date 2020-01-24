/*
* CollapsibleSidebar
* @author ykhwong
*/
$(function () {
const sidebarCookieName = 'sidebarHidden';
const commonImgUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb";
const img = {
	next: commonImgUrl + "/9/95/Icons8_flat_next.svg/15px-Icons8_flat_next.svg.png",
	prev: commonImgUrl + "/b/bd/Icons8_flat_previous.svg/15px-Icons8_flat_previous.svg.png",
	logo: commonImgUrl + "/3/3e/WP_mobile_launch_icon.svg/30px-WP_mobile_launch_icon.svg.png"
};
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const cookieExpires = 30;
var sidebarHidden = false;
var sidebarGadgetLoaded = false;

function hideSidebar() {
	sidebarHidden = true;
	$("#sidebarCollapse").attr("src", img.next);
	updatePos();

	$("#content").css({
		"position": "relative",
		"left": "-145px",
		"right": "0px",
		"margin-right": "-145px"
	});
	$("#footer").css({
		"margin-left": "20px"
	});
	$("#mw-panel").hide();
	$("#sliderCollapseLogo, #sliderCollapseText").show();
	$.cookie( sidebarCookieName, "true", {
		expires: cookieExpires, path: '/'
	});
}

function showSidebar() {
	sidebarHidden = false;
	$("#sidebarCollapse").attr("src", img.prev);
	updatePos();

	$("#content").css({
		"position": "static",
		"left": "0px",
		"right": "auto",
		"margin-right": "0px"
	});
	$("#footer").css({
		"margin-left": "167px"
	});
	$("#mw-panel").show();
	$("#sliderCollapseLogo, #sliderCollapseText").hide();
	$.cookie( sidebarCookieName, "false", {
		expires: cookieExpires, path: '/'
	});
}

function updatePosHelper(arr) {
	const divList = [ "#sidebarCollapse", "#sliderCollapseLogo", "#sliderCollapseText" ];
	for (var i=0; i < arr.length; i++) {
		if (arr[i] === null) {
			continue;
		}
		const bDiv = divList[i];
		const bLeft = $(bDiv).css("left");
		const bSize = arr[i];
		if (bLeft !== bSize) {
			$(bDiv).css("left", bSize);
		}
	}
}

function updatePos() {
	var bWidth = 0;
	if( isMobile ) {
		bWidth = (window.outerWidth > 0) ? window.outerWidth : $("body").width;
	} else {
		bWidth = (window.innerWidth > 0) ? window.innerWidth : $("body").width;
	}
	if (bWidth >= 965) {
		updatePosHelper(sidebarHidden ? ["20px", "30px", "70px"] : ["165px", null, null]);
	} else {
		updatePosHelper(sidebarHidden ? ["4px", "15px", "55px"] : ["149px", null, null]);
	}
}

function sidebarHiddenProc() {
	var myLang = "";
	var sidebarCollapse = "";
	var newLink = "";
	var sidebarTitle = mw.config.get("wgSiteName");

	sidebarGadgetLoaded = true;
	myLang = window.location.host.split('.')[0];

	sidebarCollapse = $('<img />').attr({
		'id': 'sidebarCollapse',
		'src': img.prev,
	}).css({
		'position': 'fixed',
		'float': 'right',
		'width': '13px',
		'height': '13px',
		'top': '90px',
		'cursor': 'pointer',
		'padding': '5px',
		'-webkit-border-radius': '50px',
		'-moz-border-radius': '50px',
		'border-radius': '50px',
		'text-align': 'center',
		'border': '1px solid rgb(199, 238, 255)',
		'background': 'white'
	});

	newLink = $('<a />').attr({
		'id': 'newLink',
		'href': '/',
		'title': $(".mw-wiki-logo").attr("title")
	});

	$('<img />').attr({
		'id': 'sliderCollapseLogo',
		'src': img.logo
	}).css({
		'display': 'none',
		'position': 'absolute',
		'top': '47px',
		'cursor': 'pointer',
		'float': 'none'
	}).appendTo(newLink);

	$('<div />').attr({
		'id': 'sliderCollapseText'
	}).css({
		'display': 'none',
		'position': 'absolute',
		'top': '50px',
		'color': 'black',
		'text-decoration': 'none'
	}).html(
		sidebarTitle
	).appendTo(newLink);

	sidebarCollapse.appendTo('#mw-navigation');
	newLink.appendTo('#mw-navigation');

	if ( $.cookie( sidebarCookieName ) === "true" ) {
		hideSidebar();
	}
	updatePos();

	$(window).resize(function() {
		updatePos();
	});

	$("#sidebarCollapse").mouseover(function() {
		$(this).css("background", "rgb(223, 245, 255)");
	}).mouseout(function() {
		$(this).css("background", "white");
	}).click(function() {
		sidebarHidden ? showSidebar() : hideSidebar();
	});
}

function sidebarHiddenInit() {
	// Should only work with vector skin
	// Exception handling: Blankpage and RTRC
	if (
		mw.config.get( 'skin' ) !== 'vector' ||
		$(".mw-special-Blankpage").length !== 0
	) {
		return;
	}

	if ( $('#mw-navigation').length === 0 ) {
		var obs = new MutationObserver(function(mutations, observer) {
			if (sidebarGadgetLoaded) {
				return;
			}
			for (var i=0; i<mutations.length; ++i) {
				for (var j=0; j<mutations[i].addedNodes.length; ++j) {
					if (mutations[i].addedNodes[j].id == "mw-navigation") {
						sidebarHiddenProc();
						break;
					}
				}
			}
		});
		obs.observe(document.body, { childList: true });
		return;
	}

	sidebarHiddenProc();
}

sidebarHiddenInit();

}());
