/*
* LangLinksTranslate
* @author ykhwong
*/
$(function () {

if ( $(".interlanguage-link-target").length > 0 ) {
	convLangLinks();
} else {
	$("#p-lang-btn").click(function() {
		convLangLinks();
	});
}

function convLangLinks() {
		var autonym = $(".interlanguage-link .autonym");
		if ( autonym.length === 0 ) {
			autonym = $(".interlanguage-link-target");
		}

		for ( var i=0; i < autonym.length; i++ ) {
			var lang = $(autonym[i]).attr("title").replace(/.* – /, "").trim();
			lang = lang
			.replace(/^Simple English$/, "쉬운 영어")
			.replace(/^Belarusian \(Taraškievica orthography\)$/, "벨라루스어 (타라슈케비치어)")
			.replace(/^Novial$/, "노비알어")
			.replace(/^Atikamekw$/, "아티카메쿠어")
			.replace(/^Pennsylvania German$/, "펜실베이니아 독일어")
			.replace(/^Nāhuatl$/, "나와틀어")
			.replace(/^Jamaican Creole English$/, "자메이카 크레올 영어")
			.replace(/^Venetian$/, "베네토어")
			.replace(/^Lak$/, "라크어")
			.replace(/^Alemannisch$/, "알레만어")
			.replace(/^Aromanian$/, "아로마니아어")
			.replace(/^Arpitan$/, "아르피탄어")
			.replace(/^Bavarian$/, "바이에른어")
			.replace(/^Emiliano-Romagnolo$/, "에밀리아로마냐어")
			.replace(/^Extremaduran$/, "에스트레마두라어")
			.replace(/^Ladin$/, "라딘어")
			.replace(/^Latgalian$/, "라트갈레어")
			.replace(/^Lombard$/, "롬바르드어")
			.replace(/^Vlax Romani$/, "블락스 롬어")
			.replace(/^Picard$/, "피카드어")
			.replace(/^Piedmontese$/, "피에몬테어")
			.replace(/^Palatine German$/, "펠런타인 독일어")
			.replace(/^võro$/, "버로어")
			.replace(/^West Flemish$/, "서플라망어")
			.replace(/^Zazaki$/, "자자키어")
			.replace(/^Zeelandic$/, "제일란트어")
			.replace(/^Western Armenian$/, "서아르메니아어")
			.replace(/^Silesian$/, "실레지아어")
			.replace(/^Samogitian$/, "사모기티아어")
			.replace(/^South Azerbaijani$/, "남아제르바이잔어")
			.replace(/^Classical Chinese$/, "한문")
			.replace(/^Cantonese$/, "광둥어")
			.replace(/^Banjar$/, "반자르어")
			.replace(/^Chinese \(Min Nan\)$/, "중국어 (민난어)")
			.replace(/^Chavacano$/, "차바카노어")
			.replace(/^Sakizaya$/, "사키자야어")
			.replace(/^Min Dong Chinese$/, "민둥 중국어")
			.replace(/^Doteli$/, "도텔리어")
			.replace(/^Bishnupriya$/, "비슈누프리야어")
			.replace(/^Bhojpuri$/, "보즈푸리어")
			.replace(/^Tulu$/, "툴루어")
			.replace(/^Norfuk \/ Pitkern$/, "노퍽어 / 핏케언")
			.replace(/^Guianan Creole$/, "기아나 크레올어")
			.replace(/^Ligurian$/, "리구리아어")
			.replace(/^Livvi-Karelian$/, "리비비카렐리아어")
			.replace(/^Saterland Frisian$/, "동프리지아어")
			.replace(/^Veps$/, "벱스어")
			.replace(/^Western Punjabi$/, "서펀자브어")
			.replace(/^Kabiye$/, "카비예어")
			.replace(/^Russia Buriat$/, "러시아 부랴트어")
			.replace(/^Saraiki$/, "사라이키어")
			.replace(/^Central Bikol$/, "중앙비콜어")
			.replace(/^Tayal$/, "타얄어")
			.replace(/^Mon$/, "몬어")
			.replace(/^Mingrelian$/, "메그렐어")
			.replace(/^Dagbani$/, "다그바니어");

			$(autonym[i]).text(lang);
		}
}

}());
