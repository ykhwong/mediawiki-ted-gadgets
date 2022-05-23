$(function () {
	var arr_ids = [];
	var toc;
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
		$(nTxt).prepend("<img width='14' height='14' src=" + fileUrl + ">");
		$($($( '#toc li.toclevel-1' )[lvl]).find("a")[0]).prepend("<img style='padding-right: 4px;' width='14' height='14' src=" + fileUrl + ">");
	}

	if (
		mw.config.get('wgNamespaceNumber') !== 4 ||
		mw.config.get('wgAction') !== "view" ||
		! /[\s_]+(요청|신청)(\/|$)/.test(mw.config.get('wgTitle'))
	) {
		return;
	}

	toc = document.getElementById("toc");
	if ( ! ( toc && toc.getElementsByTagName("ul")[0] ) ) {
		return;
	}

	$( '#toc li.toclevel-1' ).each( function ( i, li ) {
		var cnt = 0;
		var checked = false;
		var hrefNode;
		var sibl;
		var txt = '#' + $.escapeSelector($( li )
			.find( 'span.toctext' ).text()
			.replace(/‎+/g, "")
			.replace(/\s+/g, "_"));
		var nTxt;

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

		nTxt = txt.replace(/^#/, "#toc-") + " .sidebar-toc-text";
		sibl = $(txt).parent().next();
		if ( sibl.html() === undefined ) {
			return;
		}

		while ( sibl.html() && sibl[0].nodeName.toLowerCase() !== "h2" ) {
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
			sibl = sibl.next();
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
