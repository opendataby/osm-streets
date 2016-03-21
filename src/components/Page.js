import React, { PropTypes, Component } from 'react'

import { DEFAULT_LANGUAGE, LANGUAGES } from '../constants/Page'
import { translate } from '../utils'


export default class Page extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired
  }

  render() {
    const {filters, data} = this.props
    let tr = translate.bind(null, data && data.translates)
    if (!data) {
      this.props.changeLanguage(DEFAULT_LANGUAGE)
    }

    return <div className='panel'>
      <div className='info'>
        <h1 className='caption'>{ tr('Streets') }</h1>
        { Object.keys(LANGUAGES).map((lang) => data && lang === data.language
            ? <b>{ LANGUAGES[lang] }</b>
            : <a className='lang'
                 href={ '#' + lang }
                 onClick={ this.props.changeLanguage.bind(this, lang) }>
            { LANGUAGES[lang] }
          </a>
        ) }
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
}
