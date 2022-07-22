/* <nowiki> */
$(function() {
	var mainTitle = mw.config.get('wgTitle');
	var isDirty = false;
	var enSource = "";
	var showKoLinksCompleted = false;

	function onlyUnique(value, index, self) {
		return self.indexOf(value) === index;
	}

	function addWarn() {
	    window.addEventListener("beforeunload", function (e) {
	        if (!isDirty) {
	            return undefined;
	        }
	        
	        var confirmationMessage = 'It looks like you have been editing something. '
	                                + 'If you leave before saving, your changes will be lost.';
	
	        (e || window.event).returnValue = confirmationMessage;
	        return confirmationMessage;
	    });
	}

	function insertAtCursor(myField, myValue) {
		if (document.selection) {
			myField.focus();
			sel = document.selection.createRange();
			sel.text = myValue;
		} else if (myField.selectionStart || myField.selectionStart == '0') {
			var startPos = myField.selectionStart;
			var endPos = myField.selectionEnd;
			myField.value = myField.value.substring(0, startPos) +
				myValue +
				myField.value.substring(endPos, myField.value.length);
		} else {
			myField.value += myValue;
		}
		myField.focus();
	}

	function getEnSource() {
		$.get(
			'https://en.wikipedia.org/w/index.php?title=' + encodeURIComponent(mainTitle) + '&action=raw', function(cont) {
			enSource = cont;
		});
	}

	function dragElement(elmnt) {
		var pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0;
		if (document.getElementById(elmnt.id + "Header")) {
			document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
		} else {
			elmnt.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
			elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		}

		function closeDragElement() {
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}

	function getVal(text, key) {
		var retData = "";
		for (var i = 0; i < text.split(/\n/).length; i++) {
			var ln = text.split(/\n/)[i];
			var regex = "^\\s*\\|\\s*" + key + "\\s*=\\s*";
			var re = new RegExp(regex,"i");
			if (ln.match(re)) {
				 retData = ln.replace(re, "");
				 break;
			}
		}
		return retData.trim();
	}

	function getTmpl(text, key, isBeginning) {
		var retData = "";
		var detected = false;
		text = text.replace(/(infobox) +/i, "$1 ");
		for (var i = 0; i < text.split(/\n/).length; i++) {
			var ln = text.split(/\n/)[i];
			if (detected) {
				if ( /^(\}\}|==)/.test(ln) ) {
					retData += ln + "\n";
					break;
				}
				retData += ln + "\n";
				continue;
			}
			var regex = "";
			if (!isBeginning) {
				regex = ".*(\\{\\{\\s*" + key + "\\s*\\|.*)";
				var re1 = new RegExp(regex,"i");
				if (ln.match(re1)) {
					ln = ln.replace(re1, "$1").replace(/\}\}.*/, "}}");
					return ln.trim();
				}
			} else {
				regex = "^\\{\\{\\s*" + key + "\\s*(\\||$)";
				var re = new RegExp(regex,"i");
				if (ln.match(re)) {
					 detected = true;
					 retData += ln + "\n";
					 continue;
				}
			}
		}
		return retData.trim();
	}

	function addBox() {
		if (!/^(0|2|10|14)$/.test(mw.config.get("wgNamespaceNumber"))) {
			return;
		}

		if ($("#koBox").length > 0) {
			return;
		}

		addWarn();

		var koBoxCss = {
			position: "fixed",
			top: $(window).height() - 500 - 30,
			left: $(window).width() - 400 - 30,
			minWidth: "400px",
			minHeight: "500px",
			zIndex: 9,
			backgroundColor: "#f1f1f1",
			border: "1px solid #d3d3d3",
			textAlign: "center"
		};
		var koBoxCssHeader = {
			padding: "10px",
			cursor: "move",
			zIndex: 10,
			backgroundColor: "#2196F3",
			color: "#fff"
		};

		$("body").append('<div id="koBox"><div id="koBoxHeader">koBox</div><textarea id="ta1" style="height: 370px;"></textarea></div>');
		$("body").append('<div id="koBox2"><div id="koBox2Header">Source&nbsp;<span id="closeKoBox2" style="text-align: right; cursor: pointer;">[Close]</span></div><textarea id="ta2" style="height: 460px;"></textarea></div>');
		$("#koBox2").hide();
		$("#koBox, #koBox2").css(koBoxCss);
		$("#koBoxHeader, #koBox2Header").css(koBoxCssHeader);

		$("#koBoxHeader")
			.append('<br /><div id="showKoLinks" style="cursor: pointer; background-color: black; color: white;">START</div>')
			.append('&nbsp;<span class="koBoxButton" onClick="copyTitle();">Get Title</span>')
			.append('&nbsp;<span class="koBoxButton" onClick="copyLinks();">Get Links</span>')
			.append('&nbsp;<span class="koBoxButton" onClick="copyCategories();">Get Cats</span>')
			.append('&nbsp;<span class="koBoxButton" onClick="copyExtLinks();">Get ExtLinks</span>')
			.append('<br /><span class="koBoxButton" id="viewSource">View Source</span>')
			.append('<span class="koBoxButton" id="replaceLnk">[[ to *[[</span>')
			.append('<span class="koBoxButton" id="fillFilmVals">FillFilmVals</span>')
			.append('<span class="koBoxButton" id="sc">SC</span>')
			.append('<span class="koBoxButton" id="iw">IW</span>')
			.append('<br /><span class="koBoxButton" id="extSite">ExtSite</span>')
			.append('<span class="koBoxButton" id="koWiki">koWiki</span>')
			.append('<label style="font-size: smaller;">Add on click<input type="checkbox" id="addOnClick" checked></label>');
		$(".koBoxButton").css({
			cursor: "pointer",
			fontSize: "smaller",
			backgroundColor: "#4CAF50",
			border: "none",
			color: "white",
			padding: "5px 10px",
			margin: "3px",
			textAlign: "center",
			textDecoration: "none",
			display: "inline-block"
		});

		dragElement(document.getElementById("koBox"));
		dragElement(document.getElementById("koBox2"));

		$("#showKoLinks").click(function() {
			showKoLinks();
		});
		$("#replaceLnk").click(function() {
			$("#ta1").val($("#ta1").val().replace(/^\[\[/mg, "* [["));
		});

		$("#extSite").click(function() {
			var tUrl;
			if (/Infobox +film/i.test(enSource)) {
				tUrl= 'https://movie.naver.com/movie/search/result.naver?query=' +
				encodeURIComponent(mainTitle.replace(/ +\(.*/, "")) +
				'&section=all&ie=utf8';
			} else {
				tUrl = 'https://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&query=' +
				encodeURIComponent(mainTitle.replace(/ +\(.*/, ""));
			}
			window.open(tUrl);
		});
		
		$("#koWiki").click(function() {
			var koTaText = $("#ta1").val();
			var koTitle = "";
			for ( var i = 0; i < koTaText.split(/\n/).length; i++ ) {
				var ln = koTaText.split(/\n/)[i];
				if (/^'''/.test(ln)) {
					koTitle = ln.replace(/^'''/, "").replace(/'''.*/, "");
					break;
				}
			}
			if (/\S/.test(koTitle)) {
				var tUrl = "https://ko.wikipedia.org/w/index.php?search=" + encodeURIComponent(koTitle);
				window.open(tUrl);
			}
		});

		$("#fillFilmVals").click(function() {
			var koTaText = $("#ta1").val();
			var resultDat = "";
			var enDat = "";
			for ( var i = 0; i < koTaText.split(/\n/).length; i++ ) {
				var ln = koTaText.split(/\n/)[i];
				if (/\|\s*촬영\s*=\s*/.test(ln) && ! /\|\s*촬영\s*=\s*\S/.test(ln)) {
					enDat = getVal(enSource, "cinematography");
					ln = ln.replace(/(\|\s*촬영\s*=\s*)/, "$1" + enDat);
				} else if (/\|\s*편집\s*=\s*/.test(ln) && ! /\|\s*편집\s*=\s*\S/.test(ln)) {
					enDat = getVal(enSource, "editing");
					ln = ln.replace(/(\|\s*편집\s*=\s*)/, "$1" + enDat);
				} else if (/\|\s*개봉\s*=\s*/.test(ln) && ! /\|\s*개봉\s*=\s*\S/.test(ln)) {
					enDat = getVal(enSource, "released");
					ln = ln.replace(/(\|\s*개봉\s*=\s*)/, "$1" + enDat).replace(/\{\{\s*film date\s*\|/ig, "{{영화 날짜|");
				} else if (/\|\s*시간\s*=\s*/.test(ln) && ! /\|\s*시간\s*=\s*\S/.test(ln)) {
					enDat = getVal(enSource, "runtime");
					ln = ln.replace(/(\|\s*시간\s*=\s*)/, "$1" + enDat).replace(/ (minutes|min\.)/ig, "분");
				} else if (/\|\s*언어\s*=\s*/.test(ln) && ! /\|\s*언어\s*=\s*\S/.test(ln)) {
					enDat = getVal(enSource, "language")
					.replace("English (language)", "영어")
					.replace("English", "영어")
					.replace("Russian", "러시아어")
					.replace("Spanish", "스페인어")
					.replace("Japanese", "일본어")
					;
					ln = ln.replace(/(\|\s*언어\s*=\s*)/, "$1" + enDat);
				} else if (/\|\s*음악\s*=\s*/.test(ln) && ! /\|\s*음악\s*=\s*\S/.test(ln)) {
					enDat = getVal(enSource, "music");
					ln = ln.replace(/(\|\s*음악\s*=\s*)/, "$1" + enDat);
				}

				resultDat += ln + "\n";
			}
			$("#ta1").val(resultDat);
		});

		function procVideoGame() {
			var resultDat = "";
			resultDat = "{{비디오 게임 정보\n|제목=\n|그림=\n}}" + "\n";
			resultDat += "'''제목'''(" + mainTitle.replace(/[_\s]\(.*\)$/, "") + ")\n\n";
			if ( /\{\{\s*(Video game reviews)/i.test(enSource) ) {
				resultDat += "== 평가 ==\n";
				resultDat += 
				getTmpl(enSource, "Video game reviews", true)
				.replace(/^\}\}/mg, "|align=none\n}}") +
				"\n\n== 각주 ==\n{{각주}}\n\n";
			}
			$("#ta1").val(resultDat);
			$("#showKoLinks").trigger("click");
			copyExtLinks();
		}
		
		function procAirport() {
			var resultDat = "";
			resultDat = "'''제목'''(" + mainTitle.replace(/[_\s]\(.*\)$/, "");
			
			if ( /\{\{\s*(airport codes)/i.test(enSource) ) {
				resultDat += ", " + getTmpl(enSource, "airport codes", false);
			}
			resultDat += ")\n\n";
			if ( /\{\{\s*(Airport-Statistics)/i.test(enSource) ) {
				resultDat += "== 통계 ==\n";
				resultDat += getTmpl(enSource, "Airport-Statistics", false) + "\n";
			}

			$("#ta1").val(resultDat);
			$("#showKoLinks").trigger("click");
			copyExtLinks();
		}

		function procSoftware() {
			var resultDat = "";
			resultDat =
				getTmpl(enSource, "Infobox software", true)
				.replace(/\[\[Unix-like(\]\]|\||#)/img, "[[유닉스 계열$1")
				.replace(/\[\[Cross-platform(\]\]|\||#)/img, "[[크로스 플랫폼$1")
				.replace(/\[\[C \(Programming language\)(\]\]|\||#)/img, "[[C (프로그래밍 언어)$1")
				.replace(/\[\[GNU General Public License(\]\]|\||#)/img, "[[GNU 일반 공중 사용 허가서$1")
				.replace(/\[\[GNU Lesser General Public License(\]\]|\||#)/img, "[[GNU 약소 일반 공중 사용 허가서$1")
				.replace(/\[\[Python \(programming language\)(\]\]|\||#)/img, "[[파이썬$1")
				.replace(/\[\[Command \(computing\)(\]\]|\||#)/img, "[[명령어 (컴퓨팅)$1")
				.replace(/\[\[Proprietary software(\]\]|\||#)/img, "[[사유 소프트웨어$1")
				.replace(/\[\[Library \(computing\)(\]\]|\||#)/img, "[[라이브러리 (컴퓨팅)$1")
				+ "\n";
			resultDat += "'''제목'''(" + mainTitle.replace(/[_\s]\(.*\)$/, "") + ")\n";
			$("#ta1").val(resultDat);
			$("#showKoLinks").trigger("click");
			copyExtLinks();
		}

		$("#sc").click(function() {
			if ( /\{\{\s*(infobox +film|infobox +movie|film +infobox|infobox +short +film)/i.test(enSource) ) {
				$("#showKoLinks").trigger("click");
				$('#addOnClick').prop('checked', true);
				copyExtLinks();
				$("#fillFilmVals").trigger("click");
			} else if ( /\{\{\s*(Infobox +video +game)/i.test(enSource) ) {
				$('#addOnClick').prop('checked', true);
				procVideoGame();
			} else if ( /\{\{\s*(infobox +airport)/i.test(enSource)) {
				$('#addOnClick').prop('checked', true);
				procAirport();
			} else if ( /\{\{\s*(infobox +software)/i.test(enSource)) {
				$('#addOnClick').prop('checked', true);
				procSoftware();
			}
		});
		
		$("#iw").click(function() {
			var koTaText = $("#ta1").val();
			$("#ta1").val(koTaText + "\n[[en:" + mainTitle + "]]\n");
		});

		$("#viewSource").click(function() {
			$("#koBox2").css({
				top: $(window).height() - 500 - 30,
				left: $(window).width() - 400 - 400 - 30
			});
			$("#koBox2").show();
			$("#ta2").val(enSource);
		});
		$("#closeKoBox2").click(function() {
			$("#koBox2").hide();
		});

		$("#ta1").keyup(function() {
			isDirty = true;
		});

	}

	window.copyToClipboard = function(text, plain) {
		if (!/\S/.test(text)) {
			return;
		}
		const elem = document.createElement('textarea');
		text = plain ? text : text.replace(/^\(/, "").replace(/\)$/, "");
		if (plain) {
			// do nothing
		} else if (/^틀:/.test(text)) {
			text = "{{" + text.replace(/^틀:/, "") + "}}";
		} else {
			text = "[[" + text + "]]";
		}
		elem.value = text;
		document.body.appendChild(elem);
		elem.select();
		document.execCommand('copy');
		document.body.removeChild(elem);
		if ($("#addOnClick").is(":checked")) {
			insertAtCursor(document.getElementById("ta1"), text);
		}
	}

	window.copyTitle = function() {
		copyToClipboard(mainTitle, true);
	}

	window.copyCategories = function() {
		var cats = "";
		$("#mw-normal-catlinks sup").each(function(idx) {
			cats += "[[" + $(this).text().replace(/^\(/, "").replace(/\)$/, "") + "]]\n";
		});
		copyToClipboard(cats, true);
	}

	window.copyLinks = function() {
		var cats = "";
		$(".koTitleGrp").each(function(idx) {
			var cat = $(this).text().replace(/^\(/, "").replace(/\)$/, "");
			if (!/^분류:/.test(cat)) {
				cats += "* [[" + cat + "]]\n";
			}
		});
		copyToClipboard(cats, true);
	}

	window.copyExtLinks = function() {
		var hold = false;
		var resultDat = "";
		for (var i = 0; i < enSource.split(/\n/).length; i++) {
			var ln = enSource.split(/\n/)[i];
			if ( hold ) {
				if ( /^\s*\[\[\s*category/i.test(ln) ) {
					break;
				}
				if (
					( ! /^\s*\{\{/.test(ln) || /^\s*\{\{\s*authority(\s|_)*control\s*\}\}\s*$/i.test(ln) )
					&& /\S/.test(ln) ) {
					resultDat += ln + "\n";
					continue;
				}
			}
			if ( /^\s*==\s*external\s+links\s*==/i.test(ln)) {
				hold = true;
				continue;
			}
		}
		if ( /\S/.test(resultDat) ) {
			if (! /== *외부 링크 *==/.test($("#ta1").val())) {
				resultDat = "== 외부 링크 ==" + "\n" + resultDat;
			}
		}
		copyToClipboard(resultDat, true);
	}

	function showKoLinks() {
		var titles = [];

		$("#mw-content-text a, #catlinks a").each(function(index) {
			if ($(this).hasClass('mw-redirect')) {
				$(this).append('<sup style="user-select: none;">[Redirect]</sup>');
			}

			if (
				$(this).attr('title') &&
				!$(this).attr('aria-label') &&
				!/Edit section: /.test($(this).attr('title'))
			) {
				titles.push($(this).attr('title'));
			}
		});
		titles = titles.filter(onlyUnique);

		for (var i = 0; i < titles.length; i++) {
			$.get("/w/api.php?action=query&titles=" + titles[i] + "&redirects&prop=langlinks&format=json&lllimit=500", function(data) {
				if (data.query.pages && Object.values(data.query.pages)[0].langlinks) {
					var title = Object.values(data.query.pages)[0].title;
					var langLinks = Object.values(data.query.pages)[0].langlinks;
					var koTitle = "";
					var zhFound = false;
					var jaFound = false;
					for (var i2 = 0; i2 < langLinks.length; i2++) {
						if (langLinks[i2].lang === "ko") {
							koTitle = langLinks[i2]["*"];
							if (zhFound && jaFound && koTitle !== "") { break; }
							continue;
						}
						if (langLinks[i2].lang === "zh") {
							zhFound = true;
							if (zhFound && jaFound && koTitle !== "") { break; }
							continue;
						}
						if (langLinks[i2].lang === "ja") {
							jaFound = true;
							if (zhFound && jaFound && koTitle !== "") { break; }
							continue;
						}
					}
					//var koTitle = Object.values(data.query.pages)[0].langlinks[0]["*"];
					if (data.query.redirects && (data.query.redirects)[0].from) {
						title = Object.values(data.query.redirects)[0].from;
					}
					if (koTitle === "" && !zhFound && !jaFound) {
						// continue
					} else {
						$("#mw-content-text a, #catlinks a").each(function(idx) {
							if ($(this).prop("title") === title && !$(this).data("koUsed")) {
								$(this).data("koUsed", "true");
								if (koTitle !== "") {
									$(this).append('<a href="javascript:void(null);" onClick="copyToClipboard(this.innerText, false);" class="koTitleGrp" style="color: green;"><sup style="user-select: none;">(' + koTitle + ')</sup></a>');
								}
								if (zhFound) {
									$(this).append('<a href="javascript:void(null);"><sub style="user-select: none; color: green;">[Z]</sub></a>');
								}
								if (jaFound) {
									$(this).append('<a href="javascript:void(null);"><sub style="user-select: none; color: green;">[J]</sub></a>');
								}
							}
						});
					}
				}
			});
		}
		$("#mw-normal-catlinks").prepend('<span style="cursor: pointer;" onClick="copyCategories();">(Get)</span>&nbsp;');
		$(".image").each(function(idx) {
			$(this).prepend(
'<a href="javascript:void(null);" onClick="copyToClipboard(\'File:\' + this.innerText + \'|thumb\', false);" style="user-select: none;">' +
				$(this).attr("href").replace(/.*File:/, "") +
				'</a>'
			);
		});
		showKoLinksCompleted = true;
	}
	getEnSource();
	addBox();

}());
/* </nowiki> */
