var baseUrl = 'http://geo2.24bpd.ru';
var ukey = 'go654zxxq4mtiftkfkqvcsyf';
var skey = '';
var limit = 5;
/** Таймер для задержки в автодополнении */
var timer = null;

//  Создаем элементы динамически
var searchControlElem = document.createElement('div');
searchControlElem.className = 'ol-unselectable ol-control';
searchControlElem.style.cssText = 'position: absolute; left: 40px; top: 10px';

var input = document.createElement('input');
input.id = 'itemSearcher';
input.placeholder = 'Поиск';
input.style.cssText = 'width: 400px; padding: 4px';
input.addEventListener('input', search);
input.addEventListener('keydown', clear);
searchControlElem.append(input);
var suggestionList = document.createElement('ul');
suggestionList.id = 'suggestions';
suggestionList.style.cssText = 'margin: 0; padding: 0; list-style-type: none;';
searchControlElem.append(suggestionList);

// Если не задан сессионный ключ, то получаем его
if (!skey) {
	getSessionKey();
}

// Добавляем контрол к OpenLayers
var SearchControl = new ol.control.Control({
	element: searchControlElem
});
map.addControl(SearchControl);

// Добавляем маркер для показа объекта
var foundPoint = new ol.Feature({
	geometry: new ol.geom.Point(ol.proj.fromLonLat([0, 0])),
});
var markerStyle = new ol.style.Style({
	image: new ol.style.Icon({
		color: '#BADA55',
		crossOrigin: 'anonymous',
		anchor: [0.5, .7],
		imgSize: [60, 60],
		//anchorXUnits: 'pixels',
		//anchorYUnits: 'pixels',
		src: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pjxzdmcgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDggNDg7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGcgaWQ9Ikljb25zIj48Zz48ZWxsaXBzZSBjeD0iMjMuOTk5OTgiIGN5PSIzNC43Mzg3NSIgcng9IjIuOTMzNDUiIHJ5PSIwLjk0MjkiIHN0eWxlPSJmaWxsOiNGNDM3MzQ7Ii8+PGc+PHBhdGggZD0iTTI0LjAwNTA1LDEyLjMxODM1Yy0zLjc3MDEsMC02LjgxLDMuMDUtNi44MSw2LjgxYzAsMC4xNCwwLjAxLDAuMjgsMC4wMTk5LDAuNDIgICAgIGMwLjAzLDAuNTYsMC4xMywxLjEyLDAuMzEsMS42NmMwLjE3MDEsMC41MywwLjQsMS4wMywwLjcxLDEuNWMwLjAyMDEsMC4wMywwLjIxMDEsMC4zLDAuNSwwLjc0YzAsMCwwLDAsMC4wMSwwLjAxICAgICBjMS4zLDEuOTYsNC43Myw3LjA5LDQuNzUsNy4xMmMwLjI0LDAuMzYsMC43NzAxLDAuMzYsMS4wMTAxLDBjMC4wMS0wLjAyLDAuMDI5OS0wLjA0LDAuMDM5OS0wLjA1ICAgICBjMC4wNy0wLjExLDUuMTEtNy42Niw1LjI3MDEtNy44OWMwLjAzOTktMC4wNywwLjA4OTktMC4xNCwwLjEzLTAuMjFjMC4yNjk5LTAuNDYsMC40Njk5LTAuOTUsMC42MDk5LTEuNDYgICAgIGMwLjE3LTAuNiwwLjI1LTEuMjIsMC4yNS0xLjg0QzMwLjgwNDk1LDE1LjM2ODM1LDI3Ljc1NTA1LDEyLjMxODM1LDI0LjAwNTA1LDEyLjMxODM1eiBNMjQuMTc0OTUsMjIuNTc4MzUgICAgIGMtMS41LDAuMDktMi43ODk5LTEuMDUtMi44OS0yLjU1Yy0wLjA4OTktMS41LDEuMDUwMS0yLjc5LDIuNTQwMS0yLjg4YzEuNS0wLjEsMi44LDEuMDQsMi44ODk5LDIuNTQgICAgIEMyNi44MDQ5NSwyMS4xODgzNSwyNS42NzQ5NSwyMi40NzgzNSwyNC4xNzQ5NSwyMi41NzgzNXoiIHN0eWxlPSJmaWxsOiNGNDM3MzQ7Ii8+PHBhdGggZD0iTTE4LjU1Mjk1LDE2LjcyMzc1YzAsMCwxLjU1MjctMy43NjQ3LDUuNDQ3LTMuNDg4OWMwLDAsMS4xNTE2LTAuMDA2MywxLjE1MTIsMC41NDgxICAgICBjLTAuMDAwNCwwLjY1NDQtMS4xNTEyLDAuNDU2My0xLjE1MTIsMC40NTYzUzIwLjYwODQ1LDEzLjgyNzQ1LDE4LjU1Mjk1LDE2LjcyMzc1eiIgc3R5bGU9ImZpbGw6I0ZDNjA2MDsiLz48L2c+PC9nPjwvZz48L3N2Zz4=',
	}),
});
var vectorSource = new ol.source.Vector({
	features: [foundPoint],
});
var vectorLayer = new ol.layer.Vector({
	source: vectorSource,
	style: markerStyle
});
map.addLayer(vectorLayer);

// ---------------------------------------------------------------------------------
// Далее идут вспомогательные функции
// ---------------------------------------------------------------------------------

/** Поиск по тексту */
function search(e) {
	var searchText = e.target.value;

	// очищаем список
	suggestionList.innerHTML = '';

	// если пустая строка - выходим
	if (searchText.length === 0) return;

	if (!limit) limit = 5;

	// Делаем задержку перед поиском (400 мс)
	clearTimeout(timer);
	timer = setTimeout(function () {
		$.getJSON(baseUrl + '/firms/1.0/', {
			skey: skey,
			q: searchText,
			limit: limit,
			srid: 4326,
			detailed: 'true',
			format: 'json'
		})
			.done(function (data) {
				if (data && data.organizations) {
					addSuggestions(data.organizations.organizations, 'orgs');
				}
			});
		$.getJSON(baseUrl + '/transport_stops/1.0/', {
			skey: skey,
			q: searchText,
			limit: limit,
			srid: 4326,
			format: 'json'
		})
			.done(function (data) {
				if (data && data.stops) {
					addSuggestions(data.stops, 'stops');
				}
			});
	}, 400 || 0);
};

/** Закрытие всплывающего окна по кнопке Escape */
function clear(e) {
	if (e.keyCode === 27) {
		input.value = '';
		suggestionList.innerHTML = '';
	}
}

/** Добавление элементов в список */
function addSuggestions(suggestions, type) {
	var sugItem
	suggestions.forEach(function (sug) {
		sugItem = document.createElement('li');
		switch (type) {
			case 'orgs':
				sugItem.innerHTML = '<img style="padding-right: 6px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADGUlEQVRIDbVW3UsUURQ/BWHQY/RSQT1Y/4ZFD7KzovVgms4YSs8R9CCBM6wirWCYSEmhM5UPmRrbh0EQglL4kFSkREEFtVEPY/tgOqauO+fWuXPvMnObXcho4HLu5+93Pu8dgDLfDWg6ZINuOqBP26C7Nui+aK6YM2lPGYj4pWHQKx3QMw4YBRt0dMBgssmxlGJPhs7EoymzDuitNuieCqiOQwRM9D06q8BFh8NgdNDmf2mEEUUVI2J3wODuiNGunIukBXxPcFaxhPxXyi1hsieJXvb4WLqsEmK/F4mJDXqGFkq1icrzmH34CuX3aeI5jh04V3K/wMlw51CaqdkitGAju86w190PsLCWZ/IjEupveuv40rzLbu1si3ERz7oCT2EbWkzKEAkqsgWnG66wlWyOSUCVQM4vf3TZVN3lYiqHcaiGQBRMxFzSei23wj2S/7mBS1mX91dzy+h9X+L9pS+LuOGtifkfOHvhNg5BcwSHsMEBw1UtIC3m05Nc6fHGHrS2aezzszesZ88plt7dgNnZtyy1PYlj9Rf5nqfpcbRAY11Qw65DU9gaF0TpR5gFAdfOqWpHExK4MDrDZbhPa/QRAc1TS0ESr0KDxPPJAr+cBQRC2i2MzjCSgoBLp6o9YoFcJ9kP9RRXTlDWRVslIJJeOOGSBdP/wwIisECboRiY5HO1zacntxQDGYtAJi2IK7Q7+87iu8Ep7t/7bf2Y2lHLvs69Z30HW9ml/S347cUH1llRh5nTfXzP3OAj7N2rF2MktPdToB3m1Ux3P1lArrpZ0crQ93m10mm/4FO+c6DCRp5truf5Wn51Hf2Cz+fJVOp3VtTx4AcEieCqIAZ52QkSvHe0C0eqO/6qOUd4tvFUtUBbTUF19AFSr+sBOKmaHBmTj4UrQlrzwBJJm3gFosIBo4PeBOmuQWhkVDgSiKQEljI8Z4GGFiTMKKoykk+mzKpr0IRdUFOs1CA7gqoN9y3QvJKaKxw8JuFHfwiaWTfUlnKRb0Ei84fPVdC4MaVw8Nti8N+WHjjuW6BRW6QiMiFpFVMxDuD33C+ccC1orGxJ/gAAAABJRU5ErkJggg=="/>' + sug.name;	
				break;
			case 'stops':
				sugItem.innerHTML = '<img style="padding-right: 6px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADmUlEQVRIDa1Wj0sTcRTfH1P9MV6lEGrlNrE6hYqstDD1DoMoCCIrQSOIQio9Zf4MK5Wps7Cpm20310wtFW2bm1q7NMW9V+/r3XW7zRHU4Mv3fd9793nf9/M7iyXLb7r25EFfrV3wCzanX7BF/IItqS6inSQjnSwQmUWBOuuBgGh3BET7rl+wgSzaUVvaWdv3dKwO+iYzmokbEItL/IJNMQOaz5oB4qu0Qt+a4FKPsmCrJeV/WYSRiqqefKK1RBbtLBwZbrdviAweMB36Ns0Tit9+YTEaM4IZ+RloJSUnfsHqIKX/u6wOFhwqM2O1zDaJGJsYgqjHhetBD0bcTohNDiOtyPsBjHtHIe4Zwfi4E+LuQYwOd+HC83qQ60r0EJGnhMlKWBbtguZ68NZZVMJL2HEhHySew1B/J7aeyYE+oQwnmhuQeN6Wh9BbVYJS6WGYGezGnit2HHt0G1Z9YyjfKNMqihmjPrGoTcTCE37TCstTY0CgtEL9nWzvE8pgormB0aqBFLl6CZgb6AR31QljqJ0WWbRHNA+ULyH8+X0DY3NBiM0FcXMjzuj1xTlMrH4lGpVYGNYWZhlflev6PxPfsLO8EFyVBeQJrQh5QO0Pcl0xJHe24V9/40/vUXihv/wYeZIkD5LkQejORUD1R0aI3NlUMJnc1fnE02TqRXD7R0LnkXxp8i3LH+Wr91wuM8BCNNso6kD0caDnOcrdz9Db+ggS0RXV9B8DO5sKeF40YaD3BX5ofwy7O9tMJxFZ1g1IPBe1yILNyTy4WwFb66u4tbGGq58CEPnow3eNN3HF54bPbwcYn2RbG2tA+7zrNcuF634drn35BIvjLqYTDngMBnKGLOo4ZpmfqrFC3/k8ViHx+RB0V9qoFMH14DrjadVFO8miIR90lBdCdEaGrksn0nQknhMtXlOjUfZHKwth5M41/CpPYvBVO0ilR1gPUFwJXNsnmh9geHoK3U/q9Vtrconnki18ziHWzTT7zfPEW1OEL8/l6YAEqgEb9yz03qggC9qwyzSLXBUF0F7KpblvDJeZlnjuh3T6aOoDlG1ce6qLqOT+ygPqgVaeO6W+AqmbLBTX0ptgDpfa6ThckY9tPKfnwBw2Bl7KCamophN5Qm9DpnARb7K6CHrO5qaFTOI5Zd+bm2ywnGR79KnShi7nQ9te4pMSzznSYm4GzXSmEqY+UZuROp79baEBSVP43dXjgkMrxUwAv3m/AGcTQ7YoIwgfAAAAAElFTkSuQmCC"/>' + sug.name;
				break;
			default:
				break;
		}
//		sugItem.textContent = sug.name;
		sugItem.style.padding = '4px';
		sugItem.style.display = 'flex';
		sugItem.style.alignItems = 'center';
		sugItem.name = sug.name;
		if (sug.geocenter) sugItem.geocenter = sug.geocenter;
		sugItem.addEventListener('click', itemSelected);
		suggestionList.append(sugItem);
	});
}

/** когда выбран один элемент из списка */
function itemSelected(event) {
	input.value = event.target.name;
	// Выделяем координаты из точки формата WKT
	const reg = /(?<x>[.\d]+) (?<y>[.\d]+)/;
	const match = reg.exec(event.target.geocenter);
	var point = {
		x: Number.parseFloat(match.groups['x']),
		y: Number.parseFloat(match.groups['y'])
	}

	// Центрируем карту по выбранному объекту
	map.getView().setZoom(16);
	var mercatorPoint = ol.proj.fromLonLat([point.x, point.y]);
	map.getView().setCenter(mercatorPoint);
	foundPoint.setGeometry(new ol.geom.Point(mercatorPoint));


	const itemEvent = new CustomEvent('onItemSelected');
	itemEvent.point = point;
	input.dispatchEvent(itemEvent);
}

/** получить skey по ukey */
function getSessionKey() {
	$.getJSON(baseUrl + '/session/', {
		ukey: ukey,
		format: 'json'
	})
		.done(function (data) {
			if (data && data.skey) {
				skey = data.skey;
			}
		});
}
