import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Map from '../components/Map'
import Details from '../components/Details'
import Page from '../components/Page'
import * as mapActions from '../actions/MapActions'
import * as detailsActions from '../actions/DetailsActions'
import * as pageActions from '../actions/PageActions'


class App extends Component {
  render () {
    const {lang, data, filters, streetId, lat, lon, zoom} = this.props
    const {positionChanged} = this.props.mapActions
    const {showDetails, hideDetails} = this.props.detailsActions
    const {changeLanguage} = this.props.pageActions

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
      <Details streetId={ streetId }
               data={ data }
               hideDetails={ hideDetails }/>
      <Page changeLanguage={ changeLanguage }
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
    pageActions: bindActionCreators(pageActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
