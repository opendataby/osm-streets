import createLocation from 'history/lib/createLocation'
import { PUSH, REPLACE } from 'history/lib/Actions'

import {
  LOCATION_CHANGE, SWITCH_PANEL, UPDATE_FILTER,
  MAP_POSITION_CHANGED,
  SET_LANGUAGE,
  SHOW_DETAILS,
  PANEL_MAP, PANEL_FILTERS, PANEL_DETAILS,
  DEFAULT_LANGUAGE, LANGUAGES,
  DEFAULT_FILTERS,
  DEFAULT_POSITION, DEFAULT_ZOOM,
} from '../constants'
import { queryWrapper, isStateChanged, queryToFilters, filterValueToQueryParam } from '../utils'


const initialState = {
  lang: DEFAULT_LANGUAGE,
  data: null,
  cache: {},
  filters: DEFAULT_FILTERS,
  streetId: null,
  locationBeforeTransitions: null,
  syncHistoryAction: PUSH,
  lat: null,
  lon: null,
  zoom: null,
  panel: PANEL_FILTERS,
}


function storeToLocation (state) {
  let q = ''
  if (state.lang) {
    q = (q ? q + '&' : q) + 'l=' + state.lang
  }
  if (state.streetId) {
    q = (q ? q + '&' : q) + 'id=' + state.streetId
  }
  if (state.lat && state.lon && state.zoom) {
    q = (q ? q + '&' : q) + 'm=' + [state.zoom, state.lat, state.lon].join('/')
  }
  for (let filter in state.filters) {
    q = (q ? q + '&' : q) + filter + '=' + filterValueToQueryParam(state.filters[filter])
  }
  return '?' + q
}

function updateLocationFromState (state, action = PUSH) {
  const old = state.locationBeforeTransitions
  return {
    ...state,
    locationBeforeTransitions: createLocation(old.pathname + storeToLocation(state), action),
    syncHistoryAction: action,
  }
}

function updateStateFromLocation (state, locationBeforeTransitions) {
  const query = queryWrapper(locationBeforeTransitions.query)
  if (isStateChanged(state, query)) {
    return {
      ...state, locationBeforeTransitions,
      lang: query.lang in LANGUAGES ? query.lang : state.lang,
      streetId: query.streetId,
      panel: state.panel === PANEL_MAP ? PANEL_MAP : query.streetId ? PANEL_DETAILS : PANEL_FILTERS,
      zoom: state.zoom === null ? query.zoom || DEFAULT_ZOOM : state.zoom,
      lat: state.lat === null ? query.lat || DEFAULT_POSITION[0] : state.lat,
      lon: state.lon === null ? query.lon || DEFAULT_POSITION[1] : state.lon,
      filters: queryToFilters(query.filters),
    }
  }
  return state
}

export default function rootReducer (state = initialState, {type, payload}) {
  switch (type) {
    case SET_LANGUAGE:
      if (payload) {
        return updateLocationFromState({...state, data: payload, cache: {}, lang: payload.language})
      }
      return state

    case UPDATE_FILTER:
      return updateLocationFromState({...state, filters: payload})

    case SWITCH_PANEL:
      return updateLocationFromState({...state, ...payload})

    case SHOW_DETAILS:
      return updateLocationFromState({...state, streetId: payload, panel: 'details'})

    case LOCATION_CHANGE:
      return updateStateFromLocation(state, payload)

    case MAP_POSITION_CHANGED:
      return updateLocationFromState({...state, ...payload}, REPLACE)

    default:
      return state
  }
}
