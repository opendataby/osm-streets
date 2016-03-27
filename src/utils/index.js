export function translate (translations, text) {
  return translations && translations[text] || text
}

function mapToZoomLatLon (map) {
  if (!map) {
    return {
      zoom: null,
      lat: null,
      lon: null,
    }
  }

  const parts = map.split('/')
  if (parts.length !== 3) {
    return {
      zoom: null,
      lat: null,
      lon: null,
    }
  }

  return {
    zoom: parseInt(parts[0]),
    lat: parseFloat(parts[1]),
    lon: parseFloat(parts[2]),
  }
}

export function queryWrapper (query) {
  const mapLocation = mapToZoomLatLon(query.m)
  return {
    lang: query.l,
    street_id: query.id,
    zoom: mapLocation.zoom,
    lat: mapLocation.lat,
    lon: mapLocation.lon,
  }
}

export function isStateWithoutMapChanged (state, query) {
  return state.lang !== query.lang ||
    state.street_id !== query.street_id
}

export function isStateChanged (state, query) {
  return isStateWithoutMapChanged(state, query) || (
      !state.street_id && (
        state.zoom !== query.zoom ||
        state.lat !== query.lat ||
        state.lon !== query.lon
      )
    )
}
