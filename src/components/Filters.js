import React, { PropTypes, Component } from 'react'
import classNames from 'classnames'

import { isRangeFilter, isSelectFilter } from '../utils'
import {
  OSM_CITY, OSM_NAME, OSM_LENGTH,
  PROP_INSTANCE_OF, DETAILS, PROP_NAMES, PROP_PLACEHOLDERS, PROP_SELECTORS,
} from '../constants'


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

  fullFilters (filters) {
    let fullFilters = {}
    fullFilters[OSM_CITY] = filters[OSM_CITY]
    fullFilters[OSM_NAME] = filters[OSM_NAME]
    fullFilters[OSM_LENGTH] = filters[OSM_LENGTH]
    fullFilters[PROP_INSTANCE_OF] = filters[PROP_INSTANCE_OF]
    for (let filter of DETAILS[filters[PROP_INSTANCE_OF]]) {
      fullFilters[filter] = filters[filter]
    }
    return fullFilters
  }

  handleChange (filters, filter, index, event) {
    const value = event.target.value
    if (index === null) {
      if (value === '') {
        delete filters[filter]
      } else {
        filters[filter] = value
      }
    } else {
      filters[filter] = filters[filter] || [null, null]
      filters[filter][index] = value === '' ? null : value
      if (filters[filter][0] === null && filters[filter][1] === null) {
        delete filters[filter]
      }
    }
    this.props.updateFilters(filters)
  }

  renderField (filters, filter, i18n) {
    const value = filters[filter]
    if (isRangeFilter(filter)) {
      return <div className='filter-item'>
        <input className='filter-input'
               type='text'
               placeholder={ i18n.pgettext.apply(i18n, PROP_PLACEHOLDERS[filter][0]) }
               value={ value && value[0] }
               onChange={ this.handleChange.bind(this, filters, filter, 0) }/>
        &nbsp;&ndash;&nbsp;
        <input className='filter-input'
               type='text'
               placeholder={ i18n.pgettext.apply(i18n, PROP_PLACEHOLDERS[filter][1]) }
               value={ value && value[1] }
               onChange={ this.handleChange.bind(this, filters, filter, 1) }/>
      </div>
    } else if (isSelectFilter(filter)) {
      return <select className='filter-item' onChange={ this.handleChange.bind(this, filters, filter, null) }>
        { Object.keys(PROP_SELECTORS[filter]).map(item =>
          <option value={ item } selected={ item === value ? 'selected' : '' }>
            { i18n.pgettext.apply(i18n, PROP_SELECTORS[filter][item]) }
          </option>)
        }
      </select>
    } else {
      return <div className='filter-item'>
        <input className='filter-input'
               type='text'
               placeholder={ i18n.pgettext.apply(i18n, PROP_PLACEHOLDERS[filter]) }
               value={ value }
               onChange={ this.handleChange.bind(this, filters, filter, null) }/>
      </div>
    }
  }

  render () {
    const {data, filters, backMap, i18n} = this.props

    if (!data) {
      return null
    }

    let stats = this.calculateStats(data, Object.keys(data.results))
    let fullFilters = this.fullFilters(filters)
    let newFilters = {...filters}

    return <div className={ classNames('filters', {'back-map': backMap})}>
      <div className='filter-stats'>
        { stats.streetsCount } { i18n.ngettext('street', 'streets', stats.streetsCount) }&nbsp;
        { i18n.gettext('with summary length') }&nbsp;
          { stats.streetsLength } { i18n.ngettext('meter in', 'meters in', stats.streetsLength) }&nbsp;
        { stats.citiesCount } { i18n.npgettext('in', 'city', 'cities', stats.citiesCount) }
      </div>

      { Object.keys(fullFilters).map((filter) =>
        <div className='filter'>
          <h3 className='filter-caption'>{ i18n.pgettext.apply(i18n, PROP_NAMES[filter]) }:</h3>
          { this.renderField(newFilters, filter, i18n) }
        </div>
      ) }
    </div>
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.data !== this.props.data || nextProps.filters !== this.props.filters
  }
}
