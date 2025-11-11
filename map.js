// Import Mapbox as an ES module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';

// Set your Mapbox access token
mapboxgl.accessToken =
  'pk.eyJ1IjoiYm9ubmlleWFuZyIsImEiOiJjbWh1dzFzcTkwNDY5MmxvenVjM2J0enNtIn0.HUB7WC42PLjgemw5109vzA';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the div element
  style: 'mapbox://styles/mapbox/streets-v12', // Map style
  center: [-71.09415, 42.36027], // [longitude, latitude]
  zoom: 12, // Initial zoom
  minZoom: 5,
  maxZoom: 18,
});

// Optional: add navigation control (zoom buttons)
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Confirm Mapbox loaded
console.log('Mapbox GL JS Loaded:', mapboxgl);