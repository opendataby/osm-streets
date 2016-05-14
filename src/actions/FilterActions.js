import { UPDATE_FILTER } from '../constants'


export function updateFilters (filters) {
  return {
    type: UPDATE_FILTER,
    payload: filters,
  }
}
