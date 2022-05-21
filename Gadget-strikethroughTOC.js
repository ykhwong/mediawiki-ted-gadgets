mw.hook('wikipage.content').add(function() {
	var arr_ids = [];
	var toc;
	var fileUrl = "";
	const waitImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Pictogram_voting_wait_green.svg/14px-Pictogram_voting_wait_green.svg.png';

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
					var filename;
					if ( pp.length > 0 ) {
						filename = $($(imgTag[i2]).text()).attr("alt");
						fileUrl = $($(imgTag[i2]).text()).attr("src");
					} else {
						filename = $(imgTag[i2]).attr("alt");
						fileUrl = $(imgTag[i2]).attr("src");
					}
					switch (filename) {
						case "Yes check.svg":
						case "X mark.svg":
						case "Yellow check.svg":
						case "U2713.svg":
							checked = true;
							break;
					}
				}
				if ( checked ) {
					break;
				}
			}
			sibl = sibl.next();
		}

		if ( !checked ) {
			$(nTxt).prepend("<img width='14' height='14' src='" + waitImg + "'>");
			$($($( '#toc li.toclevel-1' )[i]).find("a")[0]).prepend("<img style='padding-right: 4px;' width='14' height='14' src='" + waitImg + "'>");
			return;
		}

		$(nTxt).prepend("<img width='14' height='14' src=" + fileUrl + ">");
		$($($( '#toc li.toclevel-1' )[i]).find("a")[0]).prepend("<img style='padding-right: 4px;' width='14' height='14' src=" + fileUrl + ">");
	});
});
