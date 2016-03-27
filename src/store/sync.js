import { LOCATION_CHANGE } from '../constants'
import { queryWrapper, isStateChanged, isStateWithoutMapChanged } from '../utils'

const defaultSelectLocationState = state => state

/**
 * This function synchronizes your history state with the Redux store.
 * Location changes flow from history to the store. An enhanced history is
 * returned with a listen method that responds to store updates for location.
 *
 * When this history is provided to the router, this means the location data
 * will flow like this:
 * history.push -> store.dispatch -> enhancedHistory.listen -> router
 * This ensures that when the store state changes due to a replay or other
 * event, the router will be updated appropriately and can transition to the
 * correct router state.
 */
export default function syncHistoryWithStore(history, store, {
  selectLocationState = defaultSelectLocationState,
  adjustUrlOnReplay = true,
} = {}) {
  // Ensure that the reducer is mounted on the store and functioning properly.
  if (typeof selectLocationState(store.getState()) === 'undefined') {
    throw new Error(
      'Expected the routing state to be available either as `state.routing` ' +
      'or as the custom expression you can specify as `selectLocationState` ' +
      'in the `syncHistoryWithStore()` options. ' +
      'Ensure you have added the `routerReducer` to your store\'s ' +
      'reducers via `combineReducers` or whatever method you use to isolate ' +
      'your reducers.'
    )
  }

  let initialLocation
  let isTimeTraveling
  let unsubscribeFromStore
  let unsubscribeFromHistory

  const storeToLocation = state => {
    let q = ''
    if (state.lang) {
      q = (q ? q + '&' : q) + 'l=' + state.lang
    }
    if (state.street_id) {
      q = (q ? q + '&' : q) + 'id=' + state.street_id
    }
    if (state.lat && state.lon && state.zoom) {
      q = (q ? q + '&' : q) + 'm=' + [state.zoom, state.lat, state.lon].join('/')
    }
    return '?' + q
  }

  // What does the store say about current location?
  const getLocationInStore = (useInitialIfEmpty) => {
    const locationState = selectLocationState(store.getState())
    return locationState.locationBeforeTransitions ||
      (useInitialIfEmpty ? initialLocation : undefined)
  }

  // If the store is replayed, update the URL in the browser to match.
  if (adjustUrlOnReplay) {
    const handleStoreChange = () => {
      const locationInStore = getLocationInStore(true)
      if (!locationInStore) {
        return
      }

      const state = store.getState()
      const query = queryWrapper(locationInStore.query)
      if (!isStateChanged(state, query)) {
        return
      }

      // Update address bar to reflect store state
      isTimeTraveling = true
      const newLocation = history.createLocation(locationInStore.pathname + storeToLocation(state))
      if (isStateWithoutMapChanged(state, query)) {
        history.push(newLocation)
      } else {
        history.replace(newLocation)
      }
      store.dispatch({
        type: LOCATION_CHANGE,
        payload: newLocation,
      })
      isTimeTraveling = false
    }

    unsubscribeFromStore = store.subscribe(handleStoreChange)
    handleStoreChange()
  }

  // Whenever location changes, dispatch an action to get it in the store
  const handleLocationChange = (location) => {
    // ... unless we just caused that location change
    if (isTimeTraveling) {
      return
    }

    // Are we being called for the first time?
    if (!initialLocation) {
      // Remember as a fallback in case state is reset
      initialLocation = location

      // Respect persisted location, if any
      if (getLocationInStore()) {
        return
      }
    }

    // Tell the store to update by dispatching an action
    store.dispatch({
      type: LOCATION_CHANGE,
      payload: location,
    })
  }
  unsubscribeFromHistory = history.listen(handleLocationChange)

  // The enhanced history uses store as source of truth
  return {
    ...history,
    // The listeners are subscribed to the store instead of history
    listen(listener) {
      // Copy of last location.
      let lastPublishedLocation = getLocationInStore(true)

      // Keep track of whether we unsubscribed, as Redux store
      // only applies changes in subscriptions on next dispatch
      let unsubscribed = false
      const unsubscribeFromStore = store.subscribe(() => {
        const currentLocation = getLocationInStore(true)
        if (currentLocation === lastPublishedLocation) {
          return
        }
        lastPublishedLocation = currentLocation
        if (!unsubscribed) {
          listener(lastPublishedLocation)
        }
      })

      // History listeners expect a synchronous call. Make the first call to the
      // listener after subscribing to the store, in case the listener causes a
      // location change (e.g. when it redirects)
      listener(lastPublishedLocation)

      // Let user unsubscribe later
      return () => {
        unsubscribed = true
        unsubscribeFromStore()
      }
    },

    // It also provides a way to destroy internal listeners
    unsubscribe() {
      if (adjustUrlOnReplay) {
        unsubscribeFromStore()
      }
      unsubscribeFromHistory()
    },
  }
}
