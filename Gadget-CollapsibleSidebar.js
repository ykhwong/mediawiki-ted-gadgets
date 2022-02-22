/*
* CollapsibleSidebar
* @author ykhwong
*/
$(function () {
const sidebarCookieName = 'sidebarHidden';
const commonImgUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb";
const img = {
	next: commonImgUrl + "/9/95/Icons8_flat_next.svg/15px-Icons8_flat_next.svg.png",
	prev: commonImgUrl + "/b/bd/Icons8_flat_previous.svg/15px-Icons8_flat_previous.svg.png"
};
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const cookieExpires = 30;
var sidebarHidden = false;
var sidebarGadgetLoaded = false;
var fadeSpeed=15;
var lastTime = 0;
var sDiv, timer;

function autoHide() {
	if( isMobile ) {
		return;
	}
	sDiv = document.getElementById('sidebarCollapse').style;
	sDiv.opacity = 0;
	$(document).on('mousemove', function(e){
		var thisTime = Math.round(Date.now()/1000);
		if ((thisTime - lastTime) < 1) {
			return;
		}
		lastTime = thisTime;
		clearTimeout(timer);
		(function fadeIn(){(
			sDiv.opacity=parseFloat(sDiv.opacity)+0.1);
			if (sDiv.opacity<1) {
				setTimeout(fadeIn, fadeSpeed);
			} else {
				clearTimeout(timer);
			}
		})();
		timer = setTimeout(function() {
			(function fadeOut(){(
				sDiv.opacity=parseFloat(sDiv.opacity)-0.1);
				if (sDiv.opacity<0) {
					clearTimeout(timer);
				} else {
					setTimeout(fadeOut, fadeSpeed);
				}
			})();
			clearTimeout(timer);
		}, 1500);
	});
}

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
	$("#mw-data-after-content").css({
		"position": "relative",
		"left": "-145px",
		"right": "0px",
		"margin-right": "-145px"
	});
	$("#footer").css({
		"margin-left": "20px"
	});
	$("#mw-panel").hide();
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
	$("#mw-data-after-content").css({
		"position": "static",
		"left": "0px",
		"right": "auto",
		"margin-right": "0px"
	});
	$("#footer").css({
		"margin-left": "167px"
	});
	$("#mw-panel").show();
	$.cookie( sidebarCookieName, "false", {
		expires: cookieExpires, path: '/'
	});
}

function updatePos() {
	if ($("#mw-panel").outerWidth() > 160) {
		$("#sidebarCollapse").css("left", sidebarHidden ? "20px" : "165px");
		$("#left-navigation").css("margin-left", sidebarHidden ? "31px" : "176px");
	} else {
		$("#sidebarCollapse").css("left", sidebarHidden ? "4px" : "149px");
		$("#left-navigation").css("margin-left", sidebarHidden ? "15px" : "160px");
	}

	if (mw.user.options.get("visualeditor-newwikitext") === "1") {
		var menuloc = $(".oo-ui-toolbar").offset().top + $(".oo-ui-toolbar-bar").outerHeight(true);	
		$("#sidebarCollapse").css("top", ( menuloc + 15 ) + "px");
	}
}

function sidebarHiddenProc() {
	var sidebarCollapse = "";

	sidebarGadgetLoaded = true;

	sidebarCollapse = $('<img />').attr({
		'id': 'sidebarCollapse',
		'src': img.prev,
	}).css({
		'position': 'fixed',
		'float': 'right',
		'width': '13px',
		'height': '13px',
		'top': '140px',
		'cursor': 'pointer',
		'padding': '5px',
		'-webkit-border-radius': '50px',
		'-moz-border-radius': '50px',
		'border-radius': '50px',
		'text-align': 'center',
		'border': '1px solid rgb(199, 238, 255)',
		'background-color': 'white',
		'z-index': '2'
	});

	sidebarCollapse.appendTo('#mw-navigation');

	if ( $.cookie( sidebarCookieName ) === "true" ) {
		hideSidebar();
	}
	updatePos();
	autoHide();

	$(window).resize(function() {
		updatePos();
	});

	$("#sidebarCollapse").mouseover(function() {
		$(this).css("background-color", "rgb(242, 251, 255)");
	}).mouseout(function() {
		$(this).css("background-color", "white");
	}).click(function() {
		sidebarHidden ? showSidebar() : hideSidebar();
	});
}

function sidebarHiddenInit() {
	// Should only work with vector skin
	// Exception handling: Blankpage and RTRC
	if (
		! /vector/.test( mw.config.get( 'skin' ) ) ||
		$(".skin-vector-legacy").length === 0 || $(".mw-special-Blankpage").length !== 0
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

mw.loader.using('jquery.cookie').then(function () {
	sidebarHiddenInit();
});
}());
