baseUrl = 'http://geo2.24bpd.ru'
ukey = 'go654zxxq4mtiftkfkqvcsyf'
skey = ''
limit = 5

###* Таймер для задержки в автодополнении ###

timer = null
#  Создаем элементы динамически
searchControlElem = document.createElement('div')
# ---------------------------------------------------------------------------------
# Далее идут вспомогательные функции
# ---------------------------------------------------------------------------------

###* Поиск по тексту ###

search = (e) ->
  searchText = e.target.value
  # очищаем список
  suggestionList.innerHTML = ''
  # если пустая строка - выходим
  if searchText.length == 0
    return
  if !limit
    limit = 5
  # Делаем задержку перед поиском (400 мс)
  clearTimeout timer
  timer = setTimeout((->
    $.getJSON(baseUrl + '/firms/1.0/',
      skey: skey
      q: searchText
      limit: limit
      detailed: 'true'
      format: 'json').done (data) ->
      if data and data.organizations
        addSuggestions data.organizations.organizations
      return
    $.getJSON(baseUrl + '/transport_stops/1.0/',
      skey: skey
      q: searchText
      limit: limit
      format: 'json').done (data) ->
      if data and data.stops
        addSuggestions data.stops
      return
    return
  ), 400 or 0)
  return

###* Добавление элементов в список ###

addSuggestions = (suggestions) ->
  sugItem = undefined
  suggestions.forEach (sug) ->
    sugItem = document.createElement('li')
    sugItem.textContent = sug.name
    sugItem.style.padding = '4px'
    if sug.geocenter
      sugItem.geocenter = sug.geocenter
    sugItem.addEventListener 'click', itemSelected
    suggestionList.append sugItem
    return
  return

###* когда выбран один элемент из списка ###

itemSelected = (event) ->
  # Выделяем координаты из точки формата WKT
  reg = /(?<x>[.\d]+) (?<y>[.\d]+)/
  match = reg.exec(event.target.geocenter)
  point = 
    x: Number.parseFloat(match.groups['x'])
    y: Number.parseFloat(match.groups['y'])
  # Центрируем карту по выбранному объекту
  map.getView().setCenter ol.proj.transform([
    point.x
    point.y
  ], 'EPSG:4326', 'EPSG:3857')
  map.getView().setZoom 16
  itemEvent = new CustomEvent('onItemSelected')
  itemEvent.point = point
  input.dispatchEvent itemEvent
  return

###* получить skey по ukey ###

getSessionKey = ->
  $.getJSON(baseUrl + '/session/',
    ukey: ukey
    format: 'json').done (data) ->
    if data and data.skey
      skey = data.skey
    return
  return

searchControlElem.className = 'ol-unselectable ol-control'
searchControlElem.style.cssText = 'position: absolute; left: 40px; top: 10px'
input = document.createElement('input')
input.id = 'itemSearcher'
input.placeholder = 'Поиск'
input.style.cssText = 'width: 400px; padding: 4px'
input.addEventListener 'input', search
searchControlElem.append input
suggestionList = document.createElement('ul')
suggestionList.id = 'suggestions'
suggestionList.style.cssText = 'margin: 0; padding: 0; list-style-type: none;'
searchControlElem.append suggestionList
# Добавляем контрол к OpenLayers
SearchControl = new (ol.control.Control)(element: searchControlElem)
map.addControl SearchControl
# Если не задан сессионный ключ, то получаем его
if !skey
  getSessionKey()

# ---
# generated by js2coffee 2.2.0