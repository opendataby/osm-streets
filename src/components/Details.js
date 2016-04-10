import React, { PropTypes, Component } from 'react'
import classNames from 'classnames'

import { DEFAULT_DETAILS, IMAGE_PROP, DEBUG } from '../constants'
import { translate } from '../utils'


export default class Details extends Component {
  static propTypes = {
    streetId: PropTypes.string,
    data: PropTypes.object,
  }

  render () {
    const {streetId, data, backMap} = this.props

    if (!streetId || !data) {
      return null
    }

    let tr = translate.bind(null, data.translates)
    let street = data.results[streetId]
    let wikidata = data.wd_items[street.w]

    function debugInfo (prop) {
      return DEBUG
        ? <a href={ 'https://www.wikidata.org/wiki/' + prop } target='_blank'>{ prop }</a>
        : ''
    }

    return <div className={ classNames('details', {'back-map': backMap})}>
      <p className='details-item'>
        <h2>{ street.n }, { street.c } &ndash; { street.l } { tr('m') }</h2>
        { wikidata.n }{ debugInfo(street.w) } &ndash; { wikidata.l
          ? <a href={ 'https://' + data.language + '.wikipedia.org/wiki/' + wikidata.l } target='_blank'>
            { tr('Wikipedia') }
          </a>
          : <a href={ 'https://www.wikidata.org/wiki/' + street.w } target='_blank'>
            { tr('Wikidata') }
          </a>
        }
      </p>
      { wikidata.p[IMAGE_PROP] ? <img className='details-image' src={ wikidata.p[IMAGE_PROP][0] }/> : ''}
      { DEFAULT_DETAILS.map((prop) => wikidata.p[prop]
        ? <p className='details-item'>
          <b className='details-item-name'>{ data.wd_properties[prop] }</b>:{ debugInfo(prop) }<br/>
          { wikidata.p[prop].map((propValue) => typeof propValue === 'string' && propValue.startsWith('Q')
            ? <span>{ data.wd_items[propValue].n || propValue }{ debugInfo(propValue) }<br/></span>
            : <span>{ propValue }<br/></span>
          ) }
        </p>
        : '') }
    </div>
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.data !== this.props.data || nextProps.streetId !== this.props.streetId
  }
}
