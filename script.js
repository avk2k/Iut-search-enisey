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
input.addEventListener('keyup', search);
searchControlElem.append(input);

var suggestionList = document.createElement('ul');
suggestionList.style.cssText = 'margin: 0; padding: 0; list-style-type: none;';
searchControlElem.append(suggestionList);

// Добавляем контрол к OpenLayers
var SearchControl = new ol.control.Control({
	element: searchControlElem
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

	if (!limit) limit = 5;
	
	// Делаем задержку перед поиском (400 мс)
	clearTimeout(timer);
	timer = setTimeout(function () {
		$.getJSON(baseUrl + '/firms/1.0/', {
			skey: skey,
			q: searchText,
			limit: limit,
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
			limit: limit,
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
	suggestions.forEach(sug => {
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
	const reg = /(?<x>[.\d]+) (?<y>[.\d]+)/; 
	const match = reg.exec(event.target.geocenter);
	var point = {
		x: match.groups['x'],
		y: match.groups['y']
	}
	console.log(point);
}

// получить skey по ukey
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
