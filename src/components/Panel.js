import React, { PropTypes, Component } from 'react'
import classNames from 'classnames'

import Filters from '../components/Filters'
import Details from '../components/Details'
import Info from '../components/Info'
import { PANEL_MAP, PANEL_FILTERS, PANEL_DETAILS, PANEL_INFO,  LANGUAGES } from '../constants'
import { translate } from '../utils'


export default class Page extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
  }

  render () {
    const {filters, data, panel, streetId} = this.props
    let tr = translate.bind(null, data && data.translates)

    return <div className='panel'>
      <div className='header'>
        <h1 className='caption'>{ tr('Streets') }</h1>
        { Object.keys(LANGUAGES).map((lang) => data && lang === data.language
            ? <b>{ LANGUAGES[lang] }</b>
            : <a className='lang'
                 onClick={ this.props.changeLanguage.bind(this, lang) }>{ LANGUAGES[lang] }</a>
        ) }
      </div>
      <div className='panel-switcher'>
        { panel !== PANEL_MAP
          ? <button className='panel-switcher-map'
                    onClick={ this.props.setActivatePanel.bind(this, PANEL_MAP, streetId) }>{ tr('Map') }</button>
          : ''
        }
        { panel !== PANEL_FILTERS
          ? <button className={ classNames('panel-switcher-filters', {'back-button': panel === PANEL_MAP && !streetId })}
                    onClick={ this.props.setActivatePanel.bind(this, PANEL_FILTERS, null) }>{ tr('Filters') }</button>
          : ''
        }
        { streetId && panel !== PANEL_DETAILS
          ? <button className={ classNames('panel-switcher-details', {'back-button': panel === PANEL_MAP && streetId })}
                    onClick={ this.props.setActivatePanel.bind(this, PANEL_DETAILS, streetId) }>{ tr('Details') }</button>
          : ''
        }
        { panel !== PANEL_INFO
          ? <button className='panel-switcher-info'
                    onClick={ this.props.setActivatePanel.bind(this, PANEL_INFO, streetId) }>{ tr('Info') }</button>
          : ''
        }
      </div>
      { panel === PANEL_FILTERS || panel === PANEL_MAP && !streetId
        ? <Filters data={ data } filters={ filters } backMap={ panel === PANEL_MAP && !streetId }/>
        : '' }
      { panel === PANEL_DETAILS || panel === PANEL_MAP && streetId
        ? <Details data={ data } streetId={ streetId } backMap={ panel === PANEL_MAP && streetId }/>
        : '' }
      { panel === PANEL_INFO
        ? <Info data={ data }/>
        : '' }
    </div>
  }
}
