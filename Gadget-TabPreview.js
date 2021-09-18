/**
  * tabPreview
  *
  * Provides tabs for code editor and real-time preview.
  *
  * Thanks to [[:fr:Utilisateur:Seb35]] for the qPreview ([[:fr:MediaWiki:Gadget-QPreview.js]]).
  * Tabs implemented by [[:ko:User:Ykhwong]]
  * 
  */
/* globals mw, OO, $ */

const msg = {
	previewWaiting: '미리 보기를 생성하는 중...', // Generating a preview...
	codeEditorTab: '코드 편집기', // Code editor
	realtimePreviewTab: '실시간 미리 보기', // Real-time preview
	nothingToPreview: '변경 사항이 없어서 미리 보기를 생성할 수 없습니다.' // Could not generate a preview because no changes are found
};

var xhrArr = [];

function openEditTab() {
	$(".wikiEditor-ui, #editform").show();
	$("#wikiDiff").hide();
	$("#wikiPreview").html("");
	for ( var i=0; i < xhrArr.length; i++ ) {
		xhrArr[i].abort();
	}
	xhrArr = [];
	$('[aria-controls="previewTab"]').addClass("oo-ui-optionWidget-unselected").removeClass("oo-ui-optionWidget-selected");
	$('[aria-controls="editTab"]').addClass("oo-ui-optionWidget-selected").removeClass("oo-ui-optionWidget-unselected");
}

function openPreviewTab() {
	var divPreview, $previewTab, qPreviewTextbox;
	divPreview = document.getElementById('wikiPreview');
	qPreviewTextbox = '<div>{{MediaWiki:Previewnote}}</div><hr>\n';
	if(document.editform.wpSection.value === 'new') {
		qPreviewTextbox += '== ' + document.editform.wpSummary.value + ' ==\n';
	}
	qPreviewTextbox += document.getElementById('wpTextbox1').value;
	$(".wikiEditor-ui, #editform, #catlinks, #wikiDiff").hide();
	$("#wikiPreview").html(msg.previewWaiting);
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
		divPreview.innerHTML = htmlText;
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
			const myParam = urlParams.get('veaction');
			if (myParam === "editsource") {
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
							OO.ui.alert( msg.nothingToPreview ).done( function () {
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
			} else {
				return;
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
			label: msg.codeEditorTab,
			id: 'editTab'
		});
		var tabPanel2 = new OO.ui.TabPanelLayout('two', {
			label: msg.realtimePreviewTab,
			id: 'previewTab'
		});
		var index = new OO.ui.IndexLayout();
		index.addTabPanels([tabPanel1, tabPanel2]);
		$("#mw-content-text").prepend(index.$element);
		$("#mw-content-text").prepend('<div style="height: 37px;"></div>');
		$('[aria-controls="previewTab"]').on('click', openPreviewTab);
		$('[aria-controls="editTab"]').on('click', openEditTab);
		$(".oo-ui-menuLayout").css("height", "0px");
		$(".editButtons").hide();
		var wpSave = new OO.ui.ButtonWidget( {
			label: $("input#wpSave").attr("value"),
			id: 'tabPreviewWpSave',
			classes: [ 'oo-ui-widget', 'oo-ui-widget-enabled', 'oo-ui-inputWidget', 'oo-ui-buttonElement', 'oo-ui-buttonElement-framed', 'oo-ui-labelElement', 'oo-ui-flaggedElement-progressive', 'oo-ui-flaggedElement-primary', 'oo-ui-buttonInputWidget', 'oo-ui-inputWidget-input', 'oo-ui-buttonElement-button' ]
		});
		var wpDiff = new OO.ui.ButtonWidget( {
			label: $("input#wpDiff").attr("value"),
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

		var infoPopup = new OO.ui.PopupWidget({
			padded: true,
			width: 500,
			height: 'auto',
			position: 'above',
			classes: ['prevInfoPopup'],
			anchor: false,
			$content: $("#editpage-copywarn")
		});
		$("#contentSub2").append(infoPopup.$element);
		$("#tabPreviewWpSave").on("mouseover", function() {
			infoPopup.toggle(true);
			$(".prevInfoPopup").css({
				"position": "absolute",
				"top": "40px",
				"z-index": 999
			});
		}).on("mouseleave", function() {
			infoPopup.toggle(false);
		});
		$(document).keydown(function(e) {
			if(e.altKey && e.shiftKey && e.which == 80) { // Alt-Shift-P
				$('[aria-controls="previewTab"]').trigger("click");
			}
		});
		$("#wikiPreview").css("margin-top", "13px");
		$("#previewTab, #editTab, #wpPreviewWidget").remove();
	});
}

mw.loader.using('mediawiki.util', function() {
	$(proc);
});
