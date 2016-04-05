import React, { PropTypes, Component } from 'react'
import classNames from 'classnames'

import { translate } from '../utils'


export default class Filters extends Component {
  static propTypes = {
    streetId: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
  }

  render () {
    const {data, filters, backMap} = this.props

    if (!data) {
      return null
    }

    let tr = translate.bind(null, data.translates)

    return <div className={ classNames('filters', {'back-map': backMap})}>
      <div className='filter'>
        <input className='filter-add' type='text' placeholder={ tr('type filter name') }/>
      </div>

      { filters.map((filter) =>
        <div className='filter'>
          <h3 className='filter-caption'>{ filter.name }:</h3>
          <div className='filter-item'>
            <input className='filter-input' type='text' placeholder='eg. Minsk'/>
          </div>
        </div>
      ) }
    </div>
  }
}
