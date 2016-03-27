import { MAP_POSITION_CHANGED } from '../constants'


export function positionChanged (lat, lon, zoom) {
  return {
    type: MAP_POSITION_CHANGED,
    payload: {lat, lon, zoom},
  }
}
