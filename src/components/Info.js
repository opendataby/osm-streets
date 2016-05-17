import React, { PropTypes, Component } from 'react'


export default class Info extends Component {
  static propTypes = {
    data: PropTypes.object,
  }

  render () {
    const {data} = this.props

    if (!data) {
      return null
    }

    return <div className='info'>
      Sources &ndash; <a href='https://github.com/opendataby/osm-streets' target='_blank'>GitHub</a><br/>
      OSM data &ndash; <a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a><br/>
      Wikidata &ndash; <a href='https://creativecommons.org/licenses/by-sa/3.0/' target='_blank'>CC BY-SA</a> <a href='https://www.wikidata.org/' target='_blank'>Wikidata</a><br/>
    </div>
  }
  
  shouldComponentUpdate (nextProps) {
    return nextProps.data !== this.props.data
  }
}
