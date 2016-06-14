import React, { PropTypes, Component } from 'react'
import classNames from 'classnames'

import Filters from '../components/Filters'
import Details from '../components/Details'
import Info from '../components/Info'
import { PANEL_MAP, PANEL_FILTERS, PANEL_DETAILS, PANEL_INFO,  LANGUAGES } from '../constants'


export default class Page extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    data: PropTypes.object,
    streetId: PropTypes.string,
    panel: PropTypes.string.isRequired,
  }

  render () {
    const {filters, data, i18n, panel, streetId, updateFilters} = this.props

    return <div className='panel'>
      <div className='header'>
        <h1 className='caption'>{ i18n.gettext('Belarus Streets') }</h1>
        { Object.keys(LANGUAGES).map((lang) => data && lang === data.language
            ? <b>{ LANGUAGES[lang] }</b>
            : <a className='lang'
                 onClick={ this.props.changeLanguage.bind(this, lang) }>{ LANGUAGES[lang] }</a>
        ) }
      </div>
      <div className='panel-switcher'>
        { panel !== PANEL_MAP
          ? <button className='panel-switcher-map'
                    onClick={ this.props.setActivatePanel.bind(this, PANEL_MAP, streetId) }>{ i18n.gettext('Map') }</button>
          : ''
        }
        { panel !== PANEL_FILTERS
          ? <button className={ classNames('panel-switcher-filters', {'back-button': panel === PANEL_MAP && !streetId })}
                    onClick={ this.props.setActivatePanel.bind(this, PANEL_FILTERS, null) }>{ i18n.gettext('Filters') }</button>
          : ''
        }
        { streetId && panel !== PANEL_DETAILS
          ? <button className={ classNames('panel-switcher-details', {'back-button': panel === PANEL_MAP && streetId })}
                    onClick={ this.props.setActivatePanel.bind(this, PANEL_DETAILS, streetId) }>{ i18n.gettext('Details') }</button>
          : ''
        }
        { panel !== PANEL_INFO
          ? <button className='panel-switcher-info'
                    onClick={ this.props.setActivatePanel.bind(this, PANEL_INFO, streetId) }>{ i18n.gettext('Info') }</button>
          : ''
        }
      </div>
      { panel === PANEL_FILTERS || panel === PANEL_MAP && !streetId
        ? <Filters data={ data } filters={ filters } backMap={ panel === PANEL_MAP && !streetId }
                   updateFilters={ updateFilters } i18n={ i18n }/>
        : '' }
      { panel === PANEL_DETAILS || panel === PANEL_MAP && streetId
        ? <Details data={ data } streetId={ streetId } backMap={ panel === PANEL_MAP && streetId } i18n={ i18n }/>
        : '' }
      { panel === PANEL_INFO
        ? <Info data={ data }/>
        : '' }
    </div>
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.data !== this.props.data
      || nextProps.filters !== this.props.filters
      || nextProps.streetId !== this.props.streetId
      || nextProps.panel !== this.props.panel
  }
}
