import { SHOW_DETAILS, HIDE_DETAILS } from '../constants/Details'


const initialState = {
  street_id: null,
  data: null
}


export default function details (state = initialState, action) {
  switch (action.type) {
    case SHOW_DETAILS:
      return { ...state, street_id: action.payload }

    case HIDE_DETAILS:
      return { ...state, street_id: null }

    default:
      return state;
  }
}
