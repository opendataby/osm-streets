import fetch from 'isomorphic-fetch'

import { SET_LANGUAGE, SWITCH_PANEL } from '../constants'


export function changeLanguage (lang) {
  return function (dispatch) {
    fetch('./data/' + lang + '.json')
      .then(response => response.json())
      .then(data => dispatch({
        type: SET_LANGUAGE,
        payload: data,
      })
    )
  }
}

export function setActivatePanel (panel, streetId) {
  return {
    type: SWITCH_PANEL,
    payload: {panel, streetId},
  }
}
