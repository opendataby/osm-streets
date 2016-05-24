import { SHOW_DETAILS } from '../constants'


export function showDetails (streetId) {
  window.ga('send', 'event', 'app', SHOW_DETAILS, streetId)
  return {
    type: SHOW_DETAILS,
    payload: streetId,
  }
}
