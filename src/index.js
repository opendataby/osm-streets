import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import App from './containers/App'
import './styles/defaults.css'
import '../node_modules/leaflet/dist/leaflet.css'
import './styles/app.css'
import configureStore from './store/configureStore'


const store = configureStore()


render(
  <Provider store={ store }>
    <App />
  </Provider>,
  document.body
)
