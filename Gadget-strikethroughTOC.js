$(function () {
	var arr_ids = [];
	var tocname;
	var levelname;
	var fileUrl = "";
	var filename = "";
	const waitImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Pictogram_voting_wait_green.svg/14px-Pictogram_voting_wait_green.svg.png';
	const validImgs = [
		"Yes check.svg",
		"X mark.svg",
		"Yellow check.svg",
		"U2713.svg"
	];

	function addImg(nTxt, fileUrl, lvl) {
		var imgStyle = "margin-left: -23px; padding-right: 8px; padding-top: 3px;";
		var imgTag = "<img src=" + fileUrl + " width='14' height='14'" + " style='" + imgStyle +
		( tocname !== '#toc' ? "float: left;" : "" ) + "'>";

		$(nTxt).prepend("<img width='14' height='14' src=" + fileUrl + ">");
		if ( tocname === '#toc' ) {
			$($($( levelname )[lvl]).find("a")[0]).prepend(imgTag);
		} else {
			$($($( levelname )[lvl]).find("a")[0]).find('.sidebar-toc-text').prepend(imgTag);
		}
	}

	if (
		mw.config.get('wgNamespaceNumber') !== 4 ||
		mw.config.get('wgAction') !== "view" ||
		! /[\s_]+(요청|신청)(\/|$)/.test(mw.config.get('wgTitle')) ||
		/문서[\s_]+작성[\s_]+요청(\/|$)/.test(mw.config.get('wgTitle'))
	) {
		return;
	}

	if ( $('#mw-panel-toc ul').length > 0 ) {
		tocname = '#mw-panel-toc';
		levelname = tocname + ' li.sidebar-toc-level-1';
	} else if ( $('#toc ul').length > 0 ) {
		tocname = '#toc';
		levelname = tocname + ' li.toclevel-1';
	} else {
		return;
	}

	$( levelname ).each( function ( i, li ) {
		if ( i === 0 ) {
			return true;
		}
		var cnt = 0;
		var checked = false;
		var sibl;
		var txt;
		var nTxt;
		if ( tocname === '#toc' ) {
			txt = '#' + $.escapeSelector($( li )
			.find( 'span.toctext' ).text()
			.replace(/‎+/g, "")
			.replace(/\s+/g, "_"));
		} else {
			var itemNo = $( li ).find( '.sidebar-toc-text .sidebar-toc-numb' ).text();
			var itemTxt = $( li ).find( '.sidebar-toc-text' ).text().replace(itemNo, "");
			txt = '#' + $.escapeSelector(itemTxt
				.replace(/‎+/g, "").trim()
				.replace(/\s+/g, "_"));
		}

		arr_ids.forEach(function (item) {
			if ( item === txt ) {
				cnt++;
			}
		});

		arr_ids.push(txt);
		if ( cnt !== 0 ) {
			cnt++;
			txt = txt + "_" + cnt;
		}

		nTxt = txt.replace(/^#/, tocname + "-") + " .sidebar-toc-text";

		if ( $(".mw-heading").length === 0 ) {
			return;
		}
		
		var mwMainHead = $($(".mw-heading")[i - 1]);
		var mwHead = mwMainHead.next();
		while (true) {
			if (mwHead[0] === undefined) {
				break;
			}
			if ($(mwHead[0]).hasClass('mw-heading')) {
				break;
			}
			var sibl = mwHead;
			var imgTag = sibl.find('img');
			var pp = sibl.clone().find('noscript').contents().unwrap();
			if ( pp.length > 0 ) {
				imgTag = pp;
			}

			if ( imgTag.length > 0 ) {
				for ( var i2 = 0; i2 < imgTag.length; i2++ ) {
					if ( pp.length > 0 ) {
						filename = $($(imgTag[i2]).text()).attr("alt");
						fileUrl = $($(imgTag[i2]).text()).attr("src");
					} else {
						filename = $(imgTag[i2]).attr("alt");
						fileUrl = $(imgTag[i2]).attr("src");
					}
					for ( var i3 = 0; i3 < validImgs.length; i3++ ) {
						if ( filename === validImgs[i3] ) {
							checked = true;
							break;
						}
					}
				}
				if ( checked ) {
					break;
				}
			}
			mwHead = mwHead.next();
		}

		if ( !checked ) {
			addImg(nTxt, waitImg, i);
			return;
		}

		checked = false;
		for ( var i4 = 0; i4 < validImgs.length; i4++ ) {
			if ( filename === validImgs[i4] ) {
				addImg(nTxt, fileUrl, i);
				checked = true;
				break;
			}
		}

		if ( !checked ) {
			addImg(nTxt, waitImg, i);
			return;
		}

	});
});
