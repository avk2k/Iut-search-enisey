var baseUrl = 'http://geo2.24bpd.ru';
var ukey = 'go654zxxq4mtiftkfkqvcsyf';
var skey = '';
/** Таймер для задержки в автодополнении */
var timer = null;

//  Создаем элементы динамически
var controlDiv = document.createElement('div');
controlDiv.className = 'ol-unselectable ol-control';
controlDiv.style.cssText = 'position: absolute; left: 40px; top: 10px';
var input = document.createElement('input');
input.placeholder = 'Поиск';
input.style.cssText = 'width: 400px; padding: 4px';
input.addEventListener('keyup', search);
controlDiv.append(input);
var suggestionList = document.createElement('ul');
suggestionList.id = 'suggestions';
suggestionList.style.cssText = 'margin: 0; padding: 0; list-style-type: none;';
controlDiv.append(suggestionList);

// Добавляем контрол к OpenLayers
var SearchControl = new ol.control.Control({
	element: controlDiv
});
map.addControl(SearchControl);

// Если не задан сессионный ключ, то получаем его
if (!skey) {
	getSessionKey();
}

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

	// Делаем задержку перед поиском (400мс)
	clearTimeout(timer);
	timer = setTimeout(function () {
		$.getJSON(baseUrl + '/firms/1.0/', {
			skey: skey,
			q: searchText,
			limit: 5,
			detailed: 'true',
			format: 'json'
		})
			.done(data => {
				if (data && data.organizations) {
					addSuggestions(data.organizations.organizations);
				}
			});
		$.getJSON(baseUrl + '/transport_stops/1.0/', {
			skey: skey,
			q: searchText,
			limit: 5,
			format: 'json'
		})
			.done(data => {
				if (data && data.stops) {
					addSuggestions(data.stops);
				}
			});
	}, 400 || 0);
};

/** Добавление элементов в список */
function addSuggestions(suggestions) {
	var sugItem
	suggestions.forEach(function (sug) {
		sugItem = document.createElement('li');
		sugItem.textContent = sug.name;
		sugItem.style.padding = '4px';
		if (sug.geocenter) sugItem.geocenter = sug.geocenter;
		sugItem.addEventListener('click', itemSelected);
		suggestionList.append(sugItem);
	});
}

/** когда выбран один элемент из списка */
function itemSelected(event) {
	// Выделяем координаты из точки формата WKT
	const reg = /(?<x>[.\d]+) (?<y>[.\d]+)/;
	const match = reg.exec(event.target.geocenter);
	var point = {
		x: Number.parseFloat(match.groups['x']),
		y: Number.parseFloat(match.groups['y'])
	}
	// Центрируем карту по выбранному объекту
	map.getView().setCenter(ol.proj.transform([point.x, point.y], 'EPSG:4326', 'EPSG:3857'));
	map.getView().setZoom(16);
}

/** получить skey по ukey */
function getSessionKey() {
	$.getJSON(baseUrl + '/session/', {
		ukey: ukey,
		format: 'json'
	})
		.done(data => {
			if (data && data.skey) {
				skey = data.skey;
			}
		});
}
