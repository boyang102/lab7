// Import Mapbox as an ES module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Set your Mapbox access token
mapboxgl.accessToken =
  'pk.eyJ1IjoiYm9ubmlleWFuZyIsImEiOiJjbWh1dzFzcTkwNDY5MmxvenVjM2J0enNtIn0.HUB7WC42PLjgemw5109vzA';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027],
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

// Add zoom controls
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Wait for map to fully load before adding layers
map.on('load', async () => {
  console.log('✅ Map fully loaded.');

  // --- Boston Bike Lanes ---
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
  });

  map.addLayer({
    id: 'boston-bike-lanes',
    type: 'line',
    source: 'boston_route',
    paint: {
      'line-color': '#32D400',
      'line-width': 3,
      'line-opacity': 0.5,
    },
  });

  // --- Cambridge Bike Lanes ---
  map.addSource('cambridge_route', {
    type: 'geojson',
    data: 'https://gis.cambridgema.gov/arcgis/rest/services/OpenData/OpenData_BikeFacilities/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson',
  });

  map.addLayer({
    id: 'cambridge-bike-lanes',
    type: 'line',
    source: 'cambridge_route',
    paint: {
      'line-color': '#0099FF',
      'line-width': 3,
      'line-opacity': 0.5,
    },
  });

  console.log('🚴‍♀️ Boston and Cambridge bike lanes added!');
});