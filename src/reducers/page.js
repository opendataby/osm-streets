import { CHANGE_LANGUAGE } from '../constants/Page'


const initialState = {
  filters: [],
  data: null,
  redraw: false
}


export default function page (state = initialState, action) {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      return { ...state, data: action.payload }

    default:
      return state;
  }
}
