function pgettext (context, key) { return [context, key] }

export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE'
export const SWITCH_PANEL= 'SWITCH_PANEL'
export const MAP_POSITION_CHANGED = 'MAP_POSITION_CHANGED'
export const SET_LANGUAGE = 'SET_LANGUAGE'
export const SHOW_DETAILS = 'SHOW_DETAILS'
export const UPDATE_FILTER = 'UPDATE_FILTER'

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

export const DEFAULT_FILTERS = {'P31': 'Q5'}

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

export const PROP_NAMES = {}
PROP_NAMES[OSM_CITY] = pgettext('prop', 'city')
PROP_NAMES[OSM_NAME] = pgettext('prop', 'street name')
PROP_NAMES[OSM_LENGTH] = pgettext('prop', 'length')
PROP_NAMES[PROP_INSTANCE_OF] = pgettext('prop', 'instance')
PROP_NAMES[PROP_SEX] = pgettext('prop', 'sex')
PROP_NAMES[PROP_BIRTH_DATE] = pgettext('prop', 'birth date')
PROP_NAMES[PROP_BIRTH_PLACE] = pgettext('prop', 'place of birth')
PROP_NAMES[PROP_DEATH_DATE] = pgettext('prop', 'death date')
PROP_NAMES[PROP_DEATH_PLACE] = pgettext('prop', 'place of death')
PROP_NAMES[PROP_CITIZENSHIP] = pgettext('prop', 'citizenship')
PROP_NAMES[PROP_OCCUPATION] = pgettext('prop', 'occupation')
PROP_NAMES[PROP_COUNTRY] = pgettext('prop', 'country')
PROP_NAMES[PROP_INCEPTION_DATE] = pgettext('prop', 'inception date')
PROP_NAMES[PROP_POPULATION] = pgettext('prop', 'population')

export const PROP_PLACEHOLDERS = {}
PROP_PLACEHOLDERS[OSM_CITY] = pgettext('prop_placeholder', 'eg. Miensk')
PROP_PLACEHOLDERS[OSM_NAME] = pgettext('prop_placeholder', 'eg. Skaryny')
PROP_PLACEHOLDERS[OSM_LENGTH] = [pgettext('prop_placeholder', 'from'), pgettext('prop_placeholder', 'to')]
PROP_PLACEHOLDERS[PROP_BIRTH_DATE] = [pgettext('prop_placeholder', 'from'), pgettext('prop_placeholder', 'to')]
PROP_PLACEHOLDERS[PROP_BIRTH_PLACE] = pgettext('prop_placeholder', 'eg. Minsk')
PROP_PLACEHOLDERS[PROP_DEATH_DATE] = [pgettext('prop_placeholder', 'from'), pgettext('prop_placeholder', 'to')]
PROP_PLACEHOLDERS[PROP_DEATH_PLACE] = pgettext('prop_placeholder', 'eg. Minsk')
PROP_PLACEHOLDERS[PROP_CITIZENSHIP] = pgettext('prop_placeholder', 'eg. Belarus')
PROP_PLACEHOLDERS[PROP_OCCUPATION] = pgettext('prop_placeholder', 'eg. writer')
PROP_PLACEHOLDERS[PROP_COUNTRY] = pgettext('prop_placeholder', 'eg. Belarus')
PROP_PLACEHOLDERS[PROP_INCEPTION_DATE] = [pgettext('prop_placeholder', 'from'), pgettext('prop_placeholder', 'to')]
PROP_PLACEHOLDERS[PROP_POPULATION] = [pgettext('prop_placeholder', 'from'), pgettext('prop_placeholder', 'to')]

export const PROP_SELECTORS = {}
PROP_SELECTORS[PROP_INSTANCE_OF] = {
  'Q5': pgettext('prop_instance_of_select', 'human'),
  'Q515': pgettext('prop_instance_of_select', 'city'),
}
PROP_SELECTORS[PROP_SEX] = {
  '': pgettext('prop_sex_select', 'any'),
  'Q6581097': pgettext('prop_sex_select', 'male'),
  'Q6581072': pgettext('prop_sex_select', 'female'),
}
