import createLocation from 'history/lib/createLocation'
import { PUSH, REPLACE } from 'history/lib/Actions'

import {
  LOCATION_CHANGE,
  MAP_POSITION_CHANGED,
  SET_LANGUAGE,
  SHOW_DETAILS, HIDE_DETAILS,
  DEFAULT_LANGUAGE, LANGUAGES,
  DEFAULT_POSITION, DEFAULT_ZOOM,
} from '../constants'
import { queryWrapper, isStateChanged } from '../utils'


const initialState = {
  lang: DEFAULT_LANGUAGE,
  data: null,
  filters: [],
  streetId: null,
  locationBeforeTransitions: null,
  syncHistoryAction: PUSH,
  lat: null,
  lon: null,
  zoom: null,
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
  return '?' + q
}

function updateLocation (state, action = PUSH) {
  const old = state.locationBeforeTransitions
  return {
    ...state,
    locationBeforeTransitions: createLocation(old.pathname + storeToLocation(state), action),
    syncHistoryAction: action,
  }
}

export default function rootReducer (state = initialState, {type, payload}) {
  switch (type) {
    case SET_LANGUAGE:
      if (payload) {
        return updateLocation({...state, data: payload, lang: payload.language})
      }
      return state

    case SHOW_DETAILS:
      return updateLocation({...state, streetId: payload})

    case HIDE_DETAILS:
      return updateLocation({...state, streetId: null})

    case LOCATION_CHANGE:
      const query = queryWrapper(payload.query)
      if (isStateChanged(state, query)) {
        return {...state, locationBeforeTransitions: payload,
          lang: query.lang in LANGUAGES ? query.lang : state.lang,
          streetId: query.streetId,
          zoom: state.zoom === null ? query.zoom || DEFAULT_ZOOM : state.zoom,
          lat: state.lat === null ? query.lat || DEFAULT_POSITION[0] : state.lat,
          lon: state.lon === null ? query.lon || DEFAULT_POSITION[1] : state.lon,
        }
      }
      return state

    case MAP_POSITION_CHANGED:
      return updateLocation({...state, ...payload}, REPLACE)

    default:
      return state
  }
}
