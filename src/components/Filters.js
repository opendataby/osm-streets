import React, { PropTypes, Component } from 'react'
import classNames from 'classnames'

import { translate } from '../utils'


export default class Filters extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    data: PropTypes.object,
  }

  calculateStats (data, streetIds) {
    let streetsLength = 0
    let cities = {}

    for (let streetId of streetIds) {
      let street = data.results[streetId]
      streetsLength += street.l
      cities[street.c] = true
    }

    return {streetsLength, streetsCount: streetIds.length, citiesCount: Object.keys(cities).length}
  }

  render () {
    const {data, filters, backMap} = this.props

    if (!data) {
      return null
    }

    let stats = this.calculateStats(data, Object.keys(data.results))

    let tr = translate.bind(null, data.translates)

    return <div className={ classNames('filters', {'back-map': backMap})}>
      <div className='filter-stats'>
        { stats.streetsCount } { tr('streets') }&nbsp;
        { tr('with summary length') } { stats.streetsLength } { tr('m') }&nbsp;
        { tr('in') } { stats.citiesCount } { tr('cities') }
      </div>

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

  shouldComponentUpdate (nextProps) {
    return nextProps.data !== this.props.data || nextProps.filters !== this.props.filters
  }
}
