import { MAP_POSITION_CHANGED } from '../constants'


export function positionChanged (lat, lon, zoom) {
  window.ga('send', 'event', 'app', MAP_POSITION_CHANGED, [zoom, lat, lon].join('/'))
  return {
    type: MAP_POSITION_CHANGED,
    payload: {lat, lon, zoom},
  }
}
