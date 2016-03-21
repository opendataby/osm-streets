import React, { PropTypes, Component } from 'react'
import L from 'leaflet'

import {
  DEFAULT_POSITION,
  DEFAULT_ZOOM,
  TILE_TEMPLATE,
  TILE_OPTIONS
} from '../constants/Map'


export default class Map extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired
  }

  componentDidMount () {
    this.map = L.map(document.querySelector('.map')).setView(DEFAULT_POSITION, DEFAULT_ZOOM);
    L.tileLayer(TILE_TEMPLATE, TILE_OPTIONS).addTo(this.map);
    this.geojson = null
  }

  componentWillReceiveProps (nextProps) {
    let {showDetails} = this.props

    function getGeoJsonObject(id) {
      return {type: 'Feature', id: id, geometry: nextProps.data.results[id].g}
    }

    if (this.geojson) {
      this.map.removeLayer(this.geojson)
    }
    this.geojson = L.geoJson({
      type: 'FeatureCollection',
      features: Object.keys(nextProps.data.results).map(getGeoJsonObject)
    }, {
      onEachFeature: function (feature, layer) {
        layer.color = '#00F';
        layer.on('click', function () {
          showDetails(feature.id)
        })
      }
    }).addTo(this.map);
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    return <div className='map'></div>
  }
}
