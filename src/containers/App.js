import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Map from '../components/Map'
import Details from '../components/Details'
import Page from '../components/Page'
import * as detailsActions from '../actions/DetailsActions'
import * as pageActions from '../actions/PageActions'


class App extends Component {
  render() {
    const { details, page } = this.props
    const { showDetails, hideDetails } = this.props.detailsActions
    const { changeLanguage } = this.props.pageActions

    return <div className='app'>
      <Map filters={ page.filters }
           data={ page.data }
           showDetails={ showDetails} />
      <Details street_id={ details.street_id }
               data={ page.data }
               hideDetails={ hideDetails } />
      <Page changeLanguage={ changeLanguage }
            filters={ page.filters }
            data={ page.data } />
    </div>
  }
}

function mapStateToProps(state) {
  return state
}

function mapDispatchToProps(dispatch) {
  return {
    detailsActions: bindActionCreators(detailsActions, dispatch),
    pageActions: bindActionCreators(pageActions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
