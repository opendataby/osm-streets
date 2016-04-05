import { SHOW_DETAILS } from '../constants'


export function showDetails (streetId) {
  return {
    type: SHOW_DETAILS,
    payload: streetId,
  }
}
