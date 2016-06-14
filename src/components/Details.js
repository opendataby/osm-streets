import React, { PropTypes, Component } from 'react'
import classNames from 'classnames'

import { DETAILS, PROP_INSTANCE_OF, PROP_IMAGE, DEBUG } from '../constants'


export default class Details extends Component {
  static propTypes = {
    streetId: PropTypes.string,
    data: PropTypes.object,
  }

  render () {
    const {streetId, data, backMap, i18n} = this.props

    if (!streetId || !data) {
      return null
    }

    let street = data.results[streetId]
    let wikidata = data.wd_items[street.w]
    let details = null
    for (let value of wikidata.p[PROP_INSTANCE_OF]) {
      details = DETAILS[value]
      if (details) {
        break
      }
    }

    function debugInfo (prop) {
      return DEBUG
        ? <span> <a href={ 'https://www.wikidata.org/wiki/' + prop } target='_blank'>{ prop }</a></span>
        : ''
    }

    function wikiLink (prop, wikipediaName, wikidataName) {
      return data.wd_items[prop].l
        ? <a href={ 'https://' + data.language + '.wikipedia.org/wiki/' + data.wd_items[prop].l } target='_blank'>
          { wikipediaName || data.wd_items[prop].n || prop }{ debugInfo(prop) }<br/>
        </a>
        : <a href={ 'https://www.wikidata.org/wiki/' + prop } target='_blank'>
          { wikidataName || data.wd_items[prop].n || prop }{ debugInfo(prop) }<br/>
        </a>
    }

    return <div className={ classNames('details', {'back-map': backMap})}>
      <p className='details-item'>
        <h2>{ street.n }, { street.c } &ndash; { street.l } { i18n.ngettext('meter', 'meters', street.l) }</h2>
        { wikidata.n } &ndash; { wikiLink(street.w, i18n.gettext('Wikipedia'), i18n.gettext('Wikidata')) }
      </p>
      { wikidata.p[PROP_IMAGE] ? <img className='details-image' src={ wikidata.p[PROP_IMAGE][0] }/> : ''}
      { details.map((prop) => wikidata.p[prop]
        ? <p className='details-item'>
          <b className='details-item-name'>{ data.wd_properties[prop] }</b>:{ debugInfo(prop) }<br/>
          { wikidata.p[prop].map((propValue) => typeof propValue === 'string' && propValue.startsWith('Q')
            ? wikiLink(propValue)
            : <span>{ propValue instanceof Array ? propValue.join(', ') : propValue }<br/></span>
          ) }
        </p>
        : '') }
    </div>
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.data !== this.props.data || nextProps.streetId !== this.props.streetId
  }
}
