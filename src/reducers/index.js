import {
  LOCATION_CHANGE,
  MAP_POSITION_CHANGED,
  SET_LANGUAGE,
  SHOW_DETAILS, HIDE_DETAILS,
  DEFAULT_LANGUAGE, LANGUAGES,
  DEFAULT_POSITION, DEFAULT_ZOOM,
} from '../constants'
import { queryWrapper } from '../utils'


const initialState = {
  lang: DEFAULT_LANGUAGE,
  data: null,
  filters: [],
  street_id: null,
  locationBeforeTransitions: null,
  lat: DEFAULT_POSITION[0],
  lon: DEFAULT_POSITION[1],
  zoom: DEFAULT_ZOOM,
}


export default function rootReducer (state = initialState, {type, payload}) {
  switch (type) {
    case SET_LANGUAGE:
      if (payload) {
        return {...state, data: payload, lang: payload.language}
      }
      return state

    case SHOW_DETAILS:
      return {...state, street_id: payload}

    case HIDE_DETAILS:
      return {...state, street_id: null}

    case LOCATION_CHANGE:
      const query = queryWrapper(payload.query)
      return {...state, locationBeforeTransitions: payload,
        lang: query.lang in LANGUAGES ? query.lang : state.lang,
        street_id: query.street_id,
        zoom: query.zoom || state.zoom,
        lat: query.lat || state.lat,
        lon: query.lon || state.lon,
      }

    case MAP_POSITION_CHANGED:
      return {...state, ...payload}

    default:
      return state
  }
}
