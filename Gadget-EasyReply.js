/*
* EasyReply
* @author ykhwong
* Please note that this is a beta version of the Easy-Reply.
* TO-DO: clean up
*/

const affectedPages = [
	'위키백과:사랑방', '위키백과:사랑방_\\(기술\\)', '위키백과:사랑방_\\(전체\\)',
	'위키백과:질문방', '위키백과:방명록', '위키백과:알찬_글_후보', '위키백과:좋은_글_후보', '위키백과:알찬_목록_후보',
	'위키백과:함께_검토하기', '위키백과:위키프로젝트\/제안',
	'위키백과:삭제_토론', '위키백과:복구_토론', '위키백과:관리자_알림판', '위키백과:봇_편집_요청',
	'위키백과:문서_관리_요청', '위키백과:이동_요청', '위키백과:사용자_관리_요청', '위키백과:사용자_권한_신청',
	'위키백과:다중_계정_검사_요청', '위키백과:봇\/등록_신청', '위키백과:파일_업로드_요청'
];

$(window).on('pageshow',function(){
	function addMarginIcon() {
		var skip = false;

		$(".mw-parser-output h2, .mw-parser-output dd").each(function() {
			if ($(this).is("h2")) {
				skip = true;
				return true;
			}
			if (!skip) {
				return true;
			}
			if ($(this).is("dd")) {
				var txt = $(this).html().replace(/<(dl|dd)>.*/ig, "");
				if (/\S/.test(txt)) {
					if (/<(dl|dd)>/.test($(this).html())) {
						$(this).html(
							'<div class="css1">&nbsp;' +
							$(this).html().replace(/<(dl|dd)>/, '</div><$1>')
						);
					}
				}
			}
		});

		skip = false;
		$(".mw-parser-output h2, .mw-parser-output dd, .mw-parser-output dt, .mw-parser-output ol li, .mw-parser-output ul li, .mw-parser-output p")
		.not("li li").not("li p").not("table li").not("#toc ul li").not(".hlist ul li").each(function() {
			if ($(this).is("h2")) {
				skip = true;
				return true;
			}
			if (!skip) {
				return true;
			}
			if ($(this).is("dd")) {
				var txt = $(this).html().replace(/<(dl|dd)>.*/ig, "");
				if (/\S/.test(txt)) {
					if (/<(dl|dd)>/.test($(this).html())) {
						//$(this).html(
						//	'<div class="css1">&nbsp;' +
						//	$(this).html().replace(/<(dl|dd)>/, '</div><$1>')
						//);
					} else {
						$(this).html(
							$(this).html().replace(/(.*)/, '<div class="css1">$1<div>')
						);
					}
				}
			} else if ($(this).is("dt")) {
				if (/\S/.test($(this).text())) {
					$(this).addClass("css1");
					if ($(this).prev().is("dt") || $(this).next().is("dt")) {
						$(this).addClass("cssp");
					}
				}
			} else if ($(this).is("li")) {
				if (/\S/.test($(this).text())) {
					$(this).addClass("css1");
					$(this).addClass("css2");
					if ($(this).prev().is("li") || $(this).next().is("li")) {
						$(this).addClass("cssp");
						if ($(this).is("ol li")) {
							$(this).css("margin-left", "-45px");
						}
					}
				}
			} else if ($(this).is("p")) {
				if (/\S/.test($(this).text())) {
					$(this).addClass("css1");
					if ($(this).prev().is("p") || $(this).next().is("p")) {
						if (!/(\(KST\)|서명을 남기지 않아 다른 사용자가 추가하였습니다\.)\s*$/.test($(this).text())) {
							$(this).addClass("cssp");
						} else {
							$(this).css("margin-top", "-1.5px");
						}
					}
				}
			}
		});

		$(".css1").css({
			"height": "100%",
			"border-style": "solid",
			"border-width": "0px 1px 0px 8px",
			"padding": "12px",
			"word-break": "break-all",
			"border-color": "DodgerBlue",
			"background-color":"rgba(228, 240, 255, 1)"
		});
		$(".css2").css({
			"list-style-position": "inside",
			"padding-top": "5px",
			"padding-bottom": "5px"
		});
		$(".cssp").css({
			"margin-top": "-1.5px",
			"margin-bottom": "-1.5px"
		});
	}

	function addReplyIcon() {
		var editLink = "";

		$(".mw-editsection a, .mw-parser-output p, .mw-parser-output dd, .mw-parser-output li")
		.each(function() {
			if ($(this).attr("href")) {
				editLink = $(this).attr("href");
			}

			if ($(this).find("blockquote").length > 0) {
				return true;
			}

			if ($(this).find("dl").length > 0) {
			} else {
				if (/(\(KST\)|서명을 남기지 않아 다른 사용자가 추가하였습니다\.)\s*$/.test($(this).text())) {
					// TO-DO: Needs to be replaced with addReplayBox()
					var tmpHtml = "&nbsp;<a href='#'" +
					'onClick="var replyPopup=window.open(' + "'" + 
					"https://ko.m.wikipedia.org" +
					editLink + "','replyPopup','width=600,height=500'); var win_timer = setInterval(function() { if(replyPopup.closed) { window.location.reload(); clearInterval(win_timer); } }, 100);  return false;" + '"' +"><img src='https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Ic_reply_48px.svg/20px-Ic_reply_48px.svg.png'></a>";

					if ($(this).is("dd")) {
						$(this).html(
							$(this).html().replace(/<div>/, tmpHtml + "<div>")
						);
					} else {
						$(this).append(tmpHtml);
					}
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

	function run() {
		addMarginIcon();
		addReplyIcon();
		addReplyBox();
	}

	function main() {
		var currentPageName = mw.config.get( 'wgPageName' );
		var currentNamespace = mw.config.get( 'wgNamespaceNumber' );

		if (/^(1|3|5|7|9|11|13|15|101|103|119|829|2301|2303)$/.test(currentNamespace)) {
			run();
			return;
		}

		for (var i=0; i < affectedPages.length; i++) {
			var page = affectedPages[i];
			var re = new RegExp('^' + page + '$|#');
			if (currentPageName.startsWith(page.replace(/\\/g, "") + "/") ||
			re.exec(currentPageName)) {
				run();
				return;
			}
		}
	}
	main();
}());
