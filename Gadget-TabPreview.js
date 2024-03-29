/**
  * tabPreview
  *
  * Provides tabs for code editor and preview.
  *
  * Thanks to [[:fr:Utilisateur:Seb35]] for the qPreview ([[:fr:MediaWiki:Gadget-QPreview.js]]).
  * Tabs implemented by [[:ko:User:Ykhwong]]
  * 
  */
/* globals mw, OO, $ */

$(function () {

mw.messages.set({
	previewWaiting: '미리 보기를 생성하는 중...', // Generating a preview...
	codeEditorTab: '코드 편집기', // Code editor
	previewTab: '미리 보기', // Preview
	nothingToPreview: '변경 사항이 없어서 미리 보기를 생성할 수 없습니다.', // Could not generate a preview because no changes are found
	altShiftE: '[alt-shift-e]'
});

var xhrArr = [];
var popupArr = [];

function scrollUp() {
	if ( $(".oo-ui-menuLayout").offset().top - $(window).scrollTop() === 0 ) {
		window.focus();
		window.scrollTo(0, 0);
	}
}

function openEditTab() {
	scrollUp();
	$(".wikiEditor-ui, #editform").show();
	$("#wikiPreview").html("").hide();
	$("#wikiDiff").hide();
	for ( var i=0; i < xhrArr.length; i++ ) {
		xhrArr[i].abort();
	}
	xhrArr = [];
	$('[aria-controls="previewTab"]').addClass("oo-ui-optionWidget-unselected").removeClass("oo-ui-optionWidget-selected");
	$('[aria-controls="editTab"]').addClass("oo-ui-optionWidget-selected").removeClass("oo-ui-optionWidget-unselected");
}

function openPreviewTab() {
	var divPreview, $previewTab, qPreviewTextbox;
	scrollUp();
	divPreview = document.getElementById('wikiPreview');
	qPreviewTextbox = "";
	if(document.editform.wpSection.value === 'new') {
		qPreviewTextbox += '== ' + document.editform.wpSummary.value + ' ==\n';
	}
	qPreviewTextbox += document.getElementById('wpTextbox1').value;
	$(".wikiEditor-ui, #editform, #catlinks, #wikiDiff").hide();
	$("#wikiPreview").show();
	$("#wikiPreview").html('<br />' + mw.msg("previewWaiting"));
	$('[aria-controls="previewTab"]').removeClass("oo-ui-optionWidget-unselected").addClass("oo-ui-optionWidget-selected");
	$('[aria-controls="editTab"]').removeClass("oo-ui-optionWidget-selected").addClass("oo-ui-optionWidget-unselected");
	var xhr = $.post(mw.util.wikiScript('api'), {
		format: 'json',
		action: 'parse',
		preview: true,
		disableeditsection: true,
		pst: true,
		title: mw.config.get('wgPageName'),
		text: qPreviewTextbox,
		prop: 'text|categorieshtml|langlinks'
	}, function(data) {
		var ulLang, divCat, previewHeader, previewnote, tablePreview, diffEnCours;
		var i, htmlText, htmlCat, langList, langLine, langLink;

		htmlText = data.parse.text['*'];
		divPreview.innerHTML = '<br />' + htmlText;
		previewnote = document.getElementById('previewnote-fr');
		if(previewnote) {
			tablePreview = previewnote.getElementsByTagName('table')[0];
			if(tablePreview) {
				tablePreview.style.backgroundColor = '#E2F2FF';
				tablePreview.style.borderColor = '#ACCEFF';
			}
		}

		divCat = document.getElementById('catlinks');
		if(!divCat) {
			divCat = document.createElement('div');
			divPreview.parentNode.insertBefore(divCat, divPreview.nextSibling);
		}
		htmlCat = data.parse.categorieshtml['*'];
		divCat.outerHTML = htmlCat;

		if(document.getElementById('p-lang')) {
			ulLang = document.getElementById('p-lang').getElementsByTagName('ul')[0];
			ulLang.innerHTML = '';
			langList = data.parse.langlinks;
			for(i = 0; i < langList.length; i++) {
				langLink = document.createElement('a');
				langLink.lang = langList[i].lang;
				langLink.setAttribute('hreflang', langList[i].lang);
				langLink.title = langList[i]['*'] + ' — ' + langList[i].langname;
				langLink.href = langList[i].url;
				langLink.innerHTML = langList[i].autonym;
				langLine = document.createElement('li');
				langLine.className = 'interlanguage-link interwiki-' + langList[i].lang;
				langLine.appendChild(langLink);
				ulLang.appendChild(langLine);
			}
		}

		diffEnCours = document.getElementById('wikiDiff');
		if(diffEnCours) {
			diffEnCours.style.display = 'none';
		}
	});
	xhrArr.push(xhr);
}

function proc() {
	if ( $("#wpSaveWidget").length === 0 ) {
		function onElementInserted(containerSelector, elementSelector, callback) {
			var onMutationsObserved = function(mutations) {
				mutations.forEach(function(mutation) {
					if (mutation.addedNodes.length) {
						var elements = $(mutation.addedNodes).find(elementSelector);
						for (var i = 0, len = elements.length; i < len; i++) {
							callback(elements[i]);
						}
					}
				});
			};

			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
			var observer = new MutationObserver(onMutationsObserved);
			observer.observe( $(containerSelector)[0], { childList: true, subtree: true } );
		}

		onElementInserted('body', '.oo-ui-toolbar-bar .ve-ui-toolbar-group-save .oo-ui-tool-title', function(element) {
			const urlParams = new URLSearchParams(window.location.search);
			if (urlParams.get('veaction') === "editsource") {
				if ( $("#previewTab").length > 0 ) {
					return;
				}
				mw.loader.using( [ 'oojs-ui-core' ] ).done( function () {
					var b = new OO.ui.ButtonInputWidget( {
						label: "P",
						id: 'previewTab'
					});
					b.on( 'click', function() {
						if ( $(".ve-ui-toolbar-group-save").attr("aria-disabled") === "true" ) {
							OO.ui.alert( mw.msg("nothingToPreview") ).done( function () {
							});
							return;
						}
						document.dispatchEvent(
							new KeyboardEvent("keydown", {
								key: "e",
								keyCode: 80,
								code: "",
								which: 80,
								altKey: true,
								shiftKey: true,
								ctrlKey: false,
								metaKey: false
							})
						);
						$(".oo-ui-icon-previous").addClass("oo-ui-icon-close").removeClass("oo-ui-icon-previous");
					});
					$( ".ve-ui-toolbar-group-save" ).after( ' ', b.$element );
				});
			}
		});
		return;
	}

	document.getElementById('wikiPreview').style.display = 'block';
	mw.loader.using(['oojs-ui-core', 'oojs-ui-widgets']).done(function() {
		function TabPanelOneLayout(name, config) {
			TabPanelOneLayout.super.call(this, name, config);
		}
		OO.inheritClass(TabPanelOneLayout, OO.ui.TabPanelLayout);
		var tabPanel1 = new TabPanelOneLayout('one', {
			label: mw.msg("codeEditorTab"),
			id: 'editTab'
		});
		var tabPanel2 = new OO.ui.TabPanelLayout('two', {
			label: mw.msg("previewTab"),
			id: 'previewTab'
		});
		var index = new OO.ui.IndexLayout();
		if ( $("#wpPreviewWidget").length > 0 ) {
			index.addTabPanels([tabPanel1, tabPanel2]);
		} else {
			index.addTabPanels([tabPanel1]);
		}
		$("#wikiPreview").before(index.$element);
		var editTabTitle = "";
		if ( /^\[/.test( $("input#wpPreview").attr("title") ) ) {
			editTabTitle = mw.msg("altShiftE") + " " + $("#ca-edit a").attr("title");
		} else {
			editTabTitle = $("#ca-edit a").attr("title") + " " + mw.msg("altShiftE");
		}
		$('[aria-controls="previewTab"]').on('click', openPreviewTab);
		$('[aria-controls="previewTab"]').prop('title', $("input#wpPreview").attr("title"));
		$('[aria-controls="editTab"]').on('click', openEditTab);
		$('[aria-controls="editTab"]').prop('title', editTabTitle);
		$(".oo-ui-menuLayout").css({
			"position": window.document.documentMode ? "relative" : "sticky",
			"z-index": 10
		});
		$(".editButtons").hide();
		var wpSave = new OO.ui.ButtonWidget( {
			label: $("input#wpSave").attr("value"),
			title: $("input#wpSave").attr("title"),
			id: 'tabPreviewWpSave',
			classes: [ 'oo-ui-widget', 'oo-ui-widget-enabled', 'oo-ui-inputWidget', 'oo-ui-buttonElement', 'oo-ui-buttonElement-framed', 'oo-ui-labelElement', 'oo-ui-flaggedElement-progressive', 'oo-ui-flaggedElement-primary', 'oo-ui-buttonInputWidget', 'oo-ui-inputWidget-input', 'oo-ui-buttonElement-button' ]
		});
		var wpDiff = new OO.ui.ButtonWidget( {
			label: $("input#wpDiff").attr("value"),
			title: $("input#wpDiff").attr("title"),
			id: 'tabPreviewWpDiff'
		});
		var editCancel = new OO.ui.ButtonWidget( {
			label: $("#mw-editform-cancel .oo-ui-labelElement-label").text(),
			flags: 'destructive',
			id: 'tabPreviewEditCancel'
		});

		wpSave.on("click", function() { $("input#wpSave").trigger("click"); });
		wpDiff.on("click", function() { $("input#wpDiff").trigger("click"); });
		editCancel.on("click", function() {
			window.location.href = $("#mw-editform-cancel a").attr("href");
		});
		$('.oo-ui-selectWidget').append('<span id="previewEditButtons" style="position: relative; top: 2.5px; float: right; vertical-align: middle; margin-right: 5px;"></span>');
		$('#previewEditButtons').append(wpSave.$element);
		$('#previewEditButtons').append(wpDiff.$element);
		$('#previewEditButtons').append(editCancel.$element);

		var cloneEditCheckBoxes = $(".editCheckboxes").html();
		var popupInfo = $(
			$("#wpSummaryLabel").html().replace(/ id="mw-/mg, ' id="tp-mw-').replace(/id="wp/mg, 'id="tp-wp') +
			'<div style="height: 5px;"></div>' +
			$(".editCheckboxes").html().replace(/ id="mw-/mg, ' id="tp-mw-').replace(/id="wp/mg, 'id="tp-wp') +
			$("#editpage-copywarn").html()
		);
		var infoPopup = new OO.ui.PopupWidget({
			padded: true,
			width: 500,
			height: 'auto',
			position: 'above',
			classes: ['prevInfoPopup'],
			anchor: false,
			$content: popupInfo
		});
		$(".oo-ui-menuLayout-menu:first").after(infoPopup.$element);

		$("#tp-wpSummary").keyup(function() {
			$("#wpSummary").val($(this).val());
		});
		$("#tp-mw-editpage-minoredit :checkbox").change(function() {
			$("#mw-editpage-minoredit :checkbox").prop("checked", this.checked);
		});
		$("#editpage-copywarn, #wpSummaryLabel, #mw-editpage-minoredit").hide();
		$("#tp-mw-editpage-watch, #tp-mw-editpage-watchlist-expiry").hide();

		var keepInfoPopup = false;
		function handlePopup(sec) {
			var tg = setTimeout(function() {
				if ( !keepInfoPopup && !$("#tp-wpSummary").is(':focus') ) {
					infoPopup.toggle(false);
				}
			}, sec * 1000);
			popupArr.push(tg);
		}

		function showPopup() {
			infoPopup.toggle(true);
			var top = $("#tabPreviewWpSave").offset().top + 35 - $(window)['scrollTop']();
			var left = $("#tabPreviewWpSave").offset().left - 500 + $("#tabPreviewWpSave").width();
			$(".prevInfoPopup").css({
				"position": "fixed",
				"top": top,
				"left": left,
				"z-index": 999
			});
		}

		$("#tp-wpSummary").on("focusout", function() {
			handlePopup(0);
		});

		infoPopup.$element.on("mouseenter", function() {
			keepInfoPopup = true;
		});
		infoPopup.$element.on("mouseleave", function() {
			keepInfoPopup = false;
			handlePopup(0.5);
		});

		$("#tabPreviewWpSave").on("mouseover", function() {
			for ( var i=0; i < popupArr.length; i++ ) {
				clearTimeout(popupArr[i]);
			}
			popupArr = [];
			showPopup();
		}).on("mouseleave", function() {
			handlePopup(0.5);
		});
		$(document).keydown(function(e) {
			if( e.altKey && e.shiftKey ) {
				switch (e.which) {
					case 80: // Alt-Shift-P
						$('[aria-controls="previewTab"]').trigger("click");
						break;
					case 69: // Alt-Shift-E
						$('[aria-controls="editTab"]').trigger("click");
						break;
					case 66: // Alt-Shift-B
						showPopup();
						$("#tp-wpSummary").focus();
						break;
				}
			}
			if( e.which === 13 ) {
				if ( $("#tp-wpSummary").is(':focus') ) {
					$("input#wpSave").trigger("click");
				}
			}
		});
		$(window).scroll(function() {
			infoPopup.toggle(false);
		});
		$("input#wpDiff").on("click", function() {
			$("#wikiDiff").css("padding-top", "37px");
			$("#wpPreview").html("").hide();
			$("#wikiDiff").show();
		});
		$("#previewTab, #editTab, #wpPreviewWidget").remove();
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('action') !== "submit") {
			$("#wikiPreview").hide();
		}
		$("#wikiDiff, #wikiPreview").css("padding-top", "37px");
		$("#editform").css("padding-top", "37px");
	});
}

mw.loader.using('mediawiki.util', function() {
	$(proc);
});

}());
