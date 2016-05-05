import {
  OSM_CITY, OSM_NAME, OSM_LENGTH,  PROP_INSTANCE_OF,
  PROP_SEX, PROP_BIRTH_DATE, PROP_BIRTH_PLACE, PROP_DEATH_DATE, PROP_DEATH_PLACE, PROP_CITIZENSHIP, PROP_OCCUPATION,
  PROP_COUNTRY, PROP_INCEPTION_DATE, PROP_POPULATION,
} from '../constants'


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

function queryParamToFilterValue (filter, value) {
  return [rangeFilter, dateRangeFilter, numericRangeFilter].indexOf(propTypes[filter]) !== -1
    ? value.split(':')
      .map((value) => value || null)
      .map((value) => value && filter === numericRangeFilter ? parseFloat(value) : value)
    : value
}

export function filterValueToQueryParam (value) {
  return value instanceof Array ? value.join(':') : value
}

export function queryToFilters (queryFilters) {
  let filters = {}
  for (let param in queryFilters) {
    filters[param] = queryParamToFilterValue(param, queryFilters[param])
  }
  return filters
}

export function queryWrapper (query) {
  const mapLocation = mapToZoomLatLon(query.m)
  let filters = {}
  for (let param in query) {
    if (param in propTypes) {
      filters[param] = query[param]
    }
  }
  return {
    lang: query.l,
    streetId: query.id,
    zoom: mapLocation.zoom,
    lat: mapLocation.lat,
    lon: mapLocation.lon,
    filters: filters,
  }
}

function isFilterValueEquals (filter, state, query) {
  let keyInState = filter in state.filters
  let keyInQuery = filter in query.filters
  if (keyInQuery && keyInState) {
    return query.filters[filter] === filterValueToQueryParam(filter, state.filters[filter])
  }
  return keyInQuery === keyInState
}

export function isStateChanged (state, query) {
  return state.lang !== query.lang ||
    state.streetId !== query.streetId || (
      !state.streetId && (
        state.zoom !== query.zoom ||
        state.lat !== query.lat ||
        state.lon !== query.lon
      )
    ) || Object.keys(propTypes).some((filter) => !isFilterValueEquals(filter, state, query))
}

function equalFilter (itemPropValues, filterValues) {
  for (let itemPropValue of itemPropValues) {
    for (let filterValue of filterValues) {
      if (itemPropValue === filterValue) {
        return true
      }
    }
  }
  return false
}

function lookupEqualFilter (itemPropValues, filterValues) {
  return equalFilter(itemPropValues, filterValues)
}

function containsFilter (itemPropValues, filterValues) {
  for (let itemPropValue of itemPropValues) {
    if (itemPropValue === null) {
      continue
    }
    for (let filterValue of filterValues) {
      if (itemPropValue.indexOf(filterValue) !== -1) {
        return true
      }
    }
  }
  return false
}

function rangeFilter (itemPropValues, filterValues) {
  const minValue = itemPropValues[0]
  const maxValue = itemPropValues[itemPropValues.length - 1]
  const min = filterValues[0]
  const max = filterValues[filterValues.length - 1]
  return (min === null || maxValue === null || min <= maxValue) &&
         (max === null || minValue === null || minValue <= max)
}

function dateRangeFilter (itemPropValues, filterValues) {
  return rangeFilter(itemPropValues, filterValues)
}

function numericRangeFilter (itemPropValues, filterValues) {
  return rangeFilter(itemPropValues, filterValues)
}

let propTypes = {}
propTypes[OSM_CITY] = containsFilter
propTypes[OSM_NAME] = containsFilter
propTypes[OSM_LENGTH] = numericRangeFilter
propTypes[PROP_INSTANCE_OF] = equalFilter

propTypes[PROP_SEX] = equalFilter
propTypes[PROP_BIRTH_DATE] = dateRangeFilter
propTypes[PROP_BIRTH_PLACE] = lookupEqualFilter
propTypes[PROP_DEATH_DATE] = dateRangeFilter
propTypes[PROP_DEATH_PLACE] = lookupEqualFilter
propTypes[PROP_CITIZENSHIP] = lookupEqualFilter
propTypes[PROP_OCCUPATION] = lookupEqualFilter

propTypes[PROP_COUNTRY] = lookupEqualFilter
propTypes[PROP_INCEPTION_DATE] = dateRangeFilter
propTypes[PROP_POPULATION] = numericRangeFilter

let osmFilters = {}
osmFilters[OSM_CITY] = 'c'
osmFilters[OSM_NAME] = 'n'
osmFilters[OSM_LENGTH] = 'l'

export function updateLookupCache (properties, data, cache) {
  const filterForCaching = properties.filter((property) =>
  propTypes[property] === lookupEqualFilter && !(property in cache))
  if (!filterForCaching.length) {
    return
  }
  for (let filter of filterForCaching) {
    cache[filter] = {}
  }
  for (let street_id of Object.keys(data.results)) {
    const item = data.results[street_id]
    for (let index of item.w.split(';')) {
      const wikidata = data.wd_items[index]
      if (!wikidata.p) {
        continue
      }
      for (let filter of filterForCaching) {
        if (!(filter in wikidata.p)) {
          continue
        }
        for (let item_id of wikidata.p[filter]) {
          if (item_id in cache[filter]) {
            continue
          }
          if (data.wd_items[item_id].n === null) {
            continue
          }
          cache[filter][item_id] = data.wd_items[item_id].n
        }
      }
    }
  }
}

export function checkAndGetLookup (property, item, cache) {
  if (propTypes[property] !== lookupEqualFilter) {
    return item
  }
  return Object.keys(cache[property]).filter((item_id) => cache[property][item_id].indexOf(item) !== -1)
}

export function filterItem (property, item, data, filterValue) {
  let filterValues
  if (filterValue instanceof Array) {
    filterValues = filterValue
  } else {
    filterValues = [filterValue]
  }
  if (property in osmFilters) {
    return propTypes[property]([item[osmFilters[property]]], filterValues)
  } else {
    for (let index of item.w.split(';')) {
      const wikidata = data.wd_items[index]
      if (!wikidata.p || !(property in wikidata.p)) {
        continue
      }
      if (propTypes[property](wikidata.p[property], filterValues)) {
        return true
      }
    }
    return false
  }
}
