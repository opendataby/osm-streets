import { SHOW_DETAILS, HIDE_DETAILS } from '../constants/Details'


export function showDetails (street_id) {
  return {
    type: SHOW_DETAILS,
    payload: street_id
  }
}

export function hideDetails () {
  return {
    type: HIDE_DETAILS,
    payload: null
  }
}
