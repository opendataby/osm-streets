import fetch from 'isomorphic-fetch'

import { SET_LANGUAGE } from '../constants'


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
