import $ from 'jquery'

import { CHANGE_LANGUAGE } from '../constants/Page'


export function changeLanguage (lang) {
  return function (dispatch) {
    $.getJSON('./data/' + lang + '.json').done(function(data) {
      dispatch({
        type: CHANGE_LANGUAGE,
        payload: data
      })
    })
  }
}
