import React, { PropTypes, Component } from 'react'
import L from 'leaflet'

import { TILE_TEMPLATE,  TILE_OPTIONS, PROP_INSTANCE_OF } from '../constants'
import { updateLookupCache, checkAndGetLookup, filterItem } from '../utils'


export default class Map extends Component {
  static propTypes = {
    filters: PropTypes.array.isRequired,
    data: PropTypes.object,
    streetId: PropTypes.string,
  }

  componentDidMount () {
    this.map = L.map(document.querySelector('.map')).setView([this.props.lat, this.props.lon], this.props.zoom);
    L.tileLayer(TILE_TEMPLATE, TILE_OPTIONS).addTo(this.map);
    this.geojson = null
    this.filters = null
    this.streetId = null

    this.map.on('moveend zoomend', () => {
      const center = this.map.getCenter()
      const zoom = this.map.getZoom()
      this.props.positionChanged(parseFloat(center.lat.toFixed(4)), parseFloat(center.lng.toFixed(4)), zoom)
    })
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.data || (nextProps.streetId === this.streetId && nextProps.filters === this.filters)) {
      return
    }
    this.streetId = nextProps.streetId
    this.filters = nextProps.filters

    let selectedStreet = null
    const {showDetails} = this.props

    function filterData (id) {
      let item = nextProps.data.results[id]
      for (let property of Object.keys(nextProps.filters)) {
        const filterValue = checkAndGetLookup(property, nextProps.filters[property], nextProps.cache)
        if (!filterItem(property, item, nextProps.data, filterValue, nextProps.filters[PROP_INSTANCE_OF])) {
          return false
        }
      }
      return true
    }

    function getGeoJsonObject (id) {
      return {type: 'Feature', id: id, geometry: nextProps.data.results[id].g}
    }

    if (this.geojson) {
      this.map.removeLayer(this.geojson)
    }
    updateLookupCache(Object.keys(nextProps.filters), nextProps.data, nextProps.cache)
    this.geojson = L.geoJson({
      type: 'FeatureCollection',
      features: Object.keys(nextProps.data.results).filter(filterData).map(getGeoJsonObject),
    }, {
      onEachFeature: function (feature, layer) {
        if (feature.id === nextProps.streetId) {
          layer.setStyle({color: '#F00', weight: 5})
          selectedStreet = layer
        } else {
          layer.setStyle({color: '#38F', weight: 3})
        }
        layer.on('click', function () {
          showDetails(feature.id)
        })
      },
    }).addTo(this.map)

    if (selectedStreet) {
      selectedStreet.bringToFront()
      this.map.panTo(selectedStreet.getCenter())
    }
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    return <div className='map'></div>
  }
}
