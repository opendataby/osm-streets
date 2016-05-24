import { UPDATE_FILTER } from '../constants'


export function updateFilters (filters) {
  window.ga('send', 'event', 'app', UPDATE_FILTER, JSON.stringify(filters))
  return {
    type: UPDATE_FILTER,
    payload: filters,
  }
}
