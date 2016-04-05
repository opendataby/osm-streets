import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Map from '../components/Map'
import Panel from '../components/Panel'
import * as mapActions from '../actions/MapActions'
import * as detailsActions from '../actions/DetailsActions'
import * as panelActions from '../actions/PanelActions'


class App extends Component {
  render () {
    const {lang, data, filters, streetId, lat, lon, zoom, panel} = this.props
    const {positionChanged} = this.props.mapActions
    const {showDetails} = this.props.detailsActions
    const {changeLanguage, setActivatePanel} = this.props.panelActions

    if (!data || lang !== data.language) {
      changeLanguage(lang)
    }

    return <div className='app'>
      <Map filters={ filters }
           data={ data }
           streetId={ streetId }
           showDetails={ showDetails}
           positionChanged={ positionChanged }
           lat={ lat } lon={ lon } zoom={ zoom }/>
      <Panel changeLanguage={ changeLanguage }
             setActivatePanel={ setActivatePanel }
             streetId={ streetId }
             panel={ panel }
             filters={ filters }
             data={ data }/>
    </div>
  }
}

function mapStateToProps (state) {
  return state
}

function mapDispatchToProps (dispatch) {
  return {
    mapActions: bindActionCreators(mapActions, dispatch),
    detailsActions: bindActionCreators(detailsActions, dispatch),
    panelActions: bindActionCreators(panelActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
