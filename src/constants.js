export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE'
export const SWITCH_PANEL= 'SWITCH_PANEL'
export const MAP_POSITION_CHANGED = 'MAP_POSITION_CHANGED'
export const SET_LANGUAGE = 'SET_LANGUAGE'
export const SHOW_DETAILS = 'SHOW_DETAILS'
export const ADD_FILTER = 'ADD_FILTER'
export const SEARCH_FILTER = 'SEARCH_FILTER'
export const CHANGE_FILTER = 'CHANGE_FILTER'
export const REMOVE_FILTER = 'REMOVE_FILTER'

export const PANEL_MAP = 'map'
export const PANEL_FILTERS = 'filters'
export const PANEL_DETAILS = 'details'
export const PANEL_INFO = 'info'

export const DEFAULT_POSITION = [54, 28]
export const DEFAULT_ZOOM = 7
export const TILE_TEMPLATE = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'
export const TILE_OPTIONS = {
  maxZoom: 18,
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}

export const DEFAULT_LANGUAGE = 'be-tarask'
export const LANGUAGES = {
  'be-tarask': 'be-tarask',
  'be': 'be',
  'ru': 'ru',
  'en': 'en',
}

export const DEFAULT_FILTERS = [
  'name',
  'city',
  'length',
  'P21',     // sex
  'P569',    // birth date
  'P570',    // death date
  'P27',     // citizenship
  'P106',    // occupation
]
