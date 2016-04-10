import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createHashHistory } from 'history'
import { useRouterHistory, Router, Route } from 'react-router'

import App from './containers/App'
import './styles/defaults.css'
import '../node_modules/leaflet/dist/leaflet.css'
import './styles/app.css'
import configureStore from './store/configureStore'
import syncHistoryWithStore from './store/sync'


const hashHistory = useRouterHistory(createHashHistory)({ queryKey: false })
const store = configureStore()
const history = syncHistoryWithStore(hashHistory, store, {
  selectLocationState: state => state,
  adjustUrlOnReplay: true,
  selectSyncLocationAction: state => state.syncHistoryAction,
})


render(
  <Provider store={ store }>
    <Router history={ history }>
      <Route path='*' component={ App } />
    </Router>
  </Provider>,
  document.getElementById('app')
)
