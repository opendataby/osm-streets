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

export const DEBUG = false

export const OSM_CITY = 'city'
export const OSM_NAME = 'name'
export const OSM_LENGTH = 'len'

export const PROP_INSTANCE_OF = 'P31'
export const PROP_IMAGE = 'P18'

export const PROP_SEX = 'P21'
export const PROP_BIRTH_DATE = 'P569'
export const PROP_DEATH_DATE = 'P570'
export const PROP_BIRTH_PLACE = 'P19'
export const PROP_DEATH_PLACE = 'P20'
export const PROP_CITIZENSHIP = 'P27'
export const PROP_OCCUPATION = 'P106'

export const PROP_COUNTRY = 'P17'
export const PROP_INCEPTION_DATE = 'P571'
export const PROP_POPULATION = 'P1082'

export const DEFAULT_FILTERS = {}

export const DETAILS = {
  'Q5': [  // human
    PROP_SEX,
    PROP_BIRTH_DATE,
    PROP_BIRTH_PLACE,
    PROP_DEATH_DATE,
    PROP_DEATH_PLACE,
    PROP_CITIZENSHIP,
    PROP_OCCUPATION,
  ],
  'Q515': [  // city
    PROP_COUNTRY,
    PROP_INCEPTION_DATE,
    PROP_POPULATION,
  ],
}
