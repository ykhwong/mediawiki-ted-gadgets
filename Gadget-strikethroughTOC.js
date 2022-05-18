mw.hook('wikipage.content').add(function() {
	var arr_ids = [];
	var toc;

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

		nTxt = txt.replace(/^#/, "#toc-");
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
					} else {
						filename = $(imgTag[i2]).attr("alt");
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
			return;
		}

		$(nTxt).wrap("<del style='color: gray !important;'>");
		hrefNode = toc.getElementsByClassName("toclevel-1")[i]
			.getElementsByTagName("a")[0];
		hrefNode.innerHTML = "<del style='color: gray !important;'>" +
			hrefNode.innerHTML + "</del>";
	});
});
