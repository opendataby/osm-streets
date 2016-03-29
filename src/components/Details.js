import React, { PropTypes, Component } from 'react'

import { translate } from '../utils'


export default class Details extends Component {
  static propTypes = {
    streetId: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
  }

  render () {
    const {streetId, data, hideDetails} = this.props

    if (!streetId || !data) {
      return null
    }

    let tr = translate.bind(null, data.translates)
    let street = data.results[streetId]
    let wikidata = data.wd_items[street.w]

    return <div className='details'>
      <h2>{ wikidata.n }</h2>
      <p>{ street.n }, { street.c } - { street.l } { tr('m') }</p>
      <p>{ wikidata.l
        ? <a href={ 'https://' + data.language + '.wikipedia.org/wiki/' + wikidata.l } target='_blank'>
        { tr('Wikipedia') }
      </a>
        : <a href={ 'https://www.wikidata.org/wiki/' + street.w } target='_blank'>
        { tr('Wikidata') }
      </a>
      }</p>
      <table>
        { Object.keys(wikidata.p).map((prop) => <tr>
          <td><b>{ data.wd_properties[prop] }</b>:</td>
          <td>{ wikidata.p[prop].map((propValue) => propValue instanceof Object
              ? <table>
              { Object.keys(propValue).map((key) => <tr>
                <td><i>{ key }</i></td>
                <td>{ propValue[key] }</td>
              </tr>) }
            </table>
              : propValue
          ) }</td>
        </tr>) }
      </table>
      <button onClick={ hideDetails }>{ tr('Close') }</button>
    </div>
  }
}
