var baseUrl = 'http://geo2.24bpd.ru';

var ukey = 'go654zxxq4mtiftkfkqvcsyf';
var skey = '';

var timer = null;

var controlDiv = document.createElement('div');
controlDiv.className = 'ol-unselectable ol-control';
controlDiv.style.cssText = 'position: absolute; left: 40px; top: 10px';

var input = document.createElement('input');
input.placeholder = 'Поиск';
input.style.cssText = 'width: 400px; padding: 4px';
input.addEventListener('keyup', search);
controlDiv.append(input);

var suggestionList = document.createElement('ul');
suggestionList.style.cssText = 'margin: 0; padding: 0; list-style-type: none';
controlDiv.append(suggestionList);

var SearchControl = new ol.control.Control({
	element: controlDiv
});
map.addControl(SearchControl);

if (!skey) {
	getSessionKey();
}


function delay(callback, ms) {
	return function () {
		var context = this, args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function () {
			callback.apply(context, args);
		}, ms || 0);
	};
}

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
	}, 500 || 0);

	return;

	delay(function (searchText) {
		console.log(searchText);
		return;
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
	}, 500)(searchText);
};

// добавляем элементы в список
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

// когда выбран один элемент из списка
function itemSelected(event) {
	var geocenter = event.target.geocenter.replace('POINT(', '').replace(')', '');
	console.log(geocenter);
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
