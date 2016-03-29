import { SHOW_DETAILS, HIDE_DETAILS } from '../constants'


export function showDetails (streetId) {
  return {
    type: SHOW_DETAILS,
    payload: streetId,
  }
}

export function hideDetails () {
  return {
    type: HIDE_DETAILS,
    payload: null,
  }
}
