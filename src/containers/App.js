import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Map from '../components/Map'
import Panel from '../components/Panel'
import * as mapActions from '../actions/MapActions'
import * as filtersActions from '../actions/FilterActions'
import * as detailsActions from '../actions/DetailsActions'
import * as panelActions from '../actions/PanelActions'


class App extends Component {
  render () {
    const {lang, data, cache, filters, streetId, lat, lon, zoom, panel} = this.props
    const {positionChanged} = this.props.mapActions
    const {showDetails} = this.props.detailsActions
    const {updateFilters} = this.props.filtersActions
    const {changeLanguage, setActivatePanel} = this.props.panelActions

    if (!data || lang !== data.language) {
      changeLanguage(lang)
    }

    return <div className='app'>
      <Map filters={ filters }
           data={ data }
           cache={ cache }
           streetId={ streetId }
           showDetails={ showDetails}
           positionChanged={ positionChanged }
           lat={ lat } lon={ lon } zoom={ zoom }/>
      <Panel changeLanguage={ changeLanguage }
             setActivatePanel={ setActivatePanel }
             updateFilters={ updateFilters }
             streetId={ streetId }
             panel={ panel }
             filters={ filters }
             data={ data }/>
    </div>
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.data !== this.props.data
      || nextProps.filters !== this.props.filters
      || nextProps.streetId !== this.props.streetId
      || nextProps.panel !== this.props.panel
  }
}

function mapStateToProps (state) {
  return state
}

function mapDispatchToProps (dispatch) {
  return {
    mapActions: bindActionCreators(mapActions, dispatch),
    filtersActions: bindActionCreators(filtersActions, dispatch),
    detailsActions: bindActionCreators(detailsActions, dispatch),
    panelActions: bindActionCreators(panelActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
