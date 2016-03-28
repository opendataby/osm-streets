import React, { PropTypes, Component } from 'react'
import L from 'leaflet'

import { TILE_TEMPLATE,  TILE_OPTIONS } from '../constants'


export default class Map extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
  }

  componentDidMount () {
    this.map = L.map(document.querySelector('.map')).setView([this.props.lat, this.props.lon], this.props.zoom);
    L.tileLayer(TILE_TEMPLATE, TILE_OPTIONS).addTo(this.map);
    this.geojson = null

    this.map.on('moveend zoomend', () => {
      const center = this.map.getCenter()
      const zoom = this.map.getZoom()
      this.props.positionChanged(parseFloat(center.lat.toFixed(4)), parseFloat(center.lng.toFixed(4)), zoom)
    })
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.data) {
      return
    }

    let {showDetails} = this.props

    function getGeoJsonObject(id) {
      return {type: 'Feature', id: id, geometry: nextProps.data.results[id].g}
    }

    if (this.geojson) {
      this.map.removeLayer(this.geojson)
    }
    this.geojson = L.geoJson({
      type: 'FeatureCollection',
      features: Object.keys(nextProps.data.results).map(getGeoJsonObject),
    }, {
      onEachFeature: function (feature, layer) {
        layer.color = '#00F';
        layer.on('click', function () {
          showDetails(feature.id)
        })
      },
    }).addTo(this.map)
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    return <div className='map'></div>
  }
}
