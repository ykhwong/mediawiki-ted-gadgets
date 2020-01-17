/*
* EasyReply
* @author ykhwong
* Please note that this is a beta version of the Easy-Reply.
* 현재 사랑방/질문방에서만 사용 가능하도록 제한함.
*/
$(window).on('pageshow',function(){
	function addMarginIcon() {
		$(".mw-parser-output dd").each(function() {
			var txt = $(this).html().replace(/<(dl|dd)>.*/ig, "");
			if (/\S/.test(txt)) {
				$(this).prepend('<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/OOjs_UI_indicator_arrow-ltr-progressive.svg/20px-OOjs_UI_indicator_arrow-ltr-progressive.svg.png">');
			}
		});
	}

	function addReplyIcon() {
		var editLink = "";

		$(".mw-editsection a, .mw-parser-output p, .mw-parser-output dd, .mw-parser-output li").each(function() {
			if ($(this).attr("href")) {
				editLink = $(this).attr("href");
			}

			if ($(this).find("dl").length > 0) {
				//console.log("★" + $(this).text());
			} else {
				if (/(\(KST\)|서명을 남기지 않아 다른 사용자가 추가하였습니다\.)\s*$/.test($(this).text())) {
					// TO-DO: Needs to be replaced with addReplayBox()
					$(this).append("&nbsp;<a href='#'" +
					'onClick="var replyPopup=window.open(' + "'" + 
					"https://ko.m.wikipedia.org" +
					editLink + "','replyPopup','width=600,height=500'); var win_timer = setInterval(function() { if(replyPopup.closed) { window.location.reload(); clearInterval(win_timer); } }, 100);  return false;" + '"' +"><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Ic_reply_48px.svg/20px-Ic_reply_48px.svg.png'></a>");
				}
			}
		});

	}

	function addReplyBox() {
		$(".mw-parser-output").append('<div id="replyBox"><textarea id="replyBoxContent" name="replyBoxContent"></textarea><div id="replyBoxClose" class="mw-ui-button">취소</div><div id="replyBoxSubmit" class="mw-ui-button mw-ui-progressive">답변하기</div><div id="autoSign"><input type="checkbox" name="autoSignInner" value="autoSignInner" id="autoSignInner" checked>자동 서명하기</div>');

		$("#replyBox").css({
			display: "none",
			position: "fixed",
			float: "left",
			width: "500px",
			height: "200px",
			background: "#f8f9fa",
			top: "50%",
			left: "50%",
			"border-style": "solid",
			"border-width": "1px",
			"border-color": "#c8ccf9"
		});

		$("#replyBoxClose").css({
			position: "absolute",
			top: "145px",
			left: "20px",
			width: "100px",
			height: "35px",
			"text-align": "center"
		}).click(function() {
			$("#replyBox").hide();
		});

		$("#replyBoxContent").css({
			position: "absolute",
			top: "15px",
			left: "20px",
			height: "110px",
			width: "460px",
			background: "white",
			resize: "none"
		});

		$("#replyBoxSubmit").css({
			position: "absolute",
			top: "145px",
			left: "135px",
			width: "100px",
			height: "35px",
			"text-align": "center"
		}).click(function() {
			// TO-DO: Submit needs to be implemented
		});

		$("#autoSign").css({
			position: "absolute",
			top: "150px",
			left: "365px"
		});
	}

	function main() {
		var currentPageName = mw.config.get( 'wgPageName' ).replace(/\/.*/, "");
		if (! ( currentPageName === '위키백과:사랑방' || currentPageName === '위키백과:질문방' ) ) {
			return;
		}
		addMarginIcon();
		addReplyIcon();
		addReplyBox();
	}
	main();
}());
