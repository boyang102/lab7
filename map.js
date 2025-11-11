// Import Mapbox and D3 as ES modules
import mapboxgl from "https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Your Mapbox token
mapboxgl.accessToken =
  "pk.eyJ1IjoiYm9ubmlleWFuZyIsImEiOiJjbWh1dzFzcTkwNDY5MmxvenVjM2J0enNtIn0.HUB7WC42PLjgemw5109vzA";

// Initialize Mapbox map
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [-71.09415, 42.36027],
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

map.addControl(new mapboxgl.NavigationControl(), "top-right");

// ✅ Helper function: convert lon/lat to pixel coords
function getCoords(station) {
  if (!station.lon || !station.lat) return { cx: -9999, cy: -9999 };
  const point = new mapboxgl.LngLat(+station.lon, +station.lat);
  const { x, y } = map.project(point);
  return { cx: x, cy: y };
}

// Wait for map to load
map.on("load", async () => {
  console.log("✅ Map loaded");

  // --- 1️⃣ Add Boston Bike Lanes ---
  map.addSource("boston_route", {
    type: "geojson",
    data: "https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson",
  });
  map.addLayer({
    id: "boston-bike-lanes",
    type: "line",
    source: "boston_route",
    paint: { "line-color": "#4CAF50", "line-width": 3, "line-opacity": 0.6 },
  });

  // --- 2️⃣ Add Cambridge Bike Lanes ---
  map.addSource("cambridge_route", {
    type: "geojson",
    data: "https://gis.cambridgema.gov/arcgis/rest/services/OpenData/OpenData_BikeFacilities/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson",
  });
  map.addLayer({
    id: "cambridge-bike-lanes",
    type: "line",
    source: "cambridge_route",
    paint: { "line-color": "#2196F3", "line-width": 3, "line-opacity": 0.6 },
  });

  // --- 3️⃣ Load Bluebike Station Data ---
  const stationsURL = "https://dsc106.com/labs/lab07/data/bluebikes-stations.json";
  const jsonData = await d3.json(stationsURL);
  let stations = jsonData.data.stations;
  console.log("Loaded stations:", stations.length);

  // --- 4️⃣ Load Bluebike Trip Data ---
  const tripURL = "https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv";
  console.log("⏳ Loading trip data (this may take a few seconds)...");
  const trips = await d3.csv(tripURL);
  console.log("Loaded trips:", trips.length);

  // --- 5️⃣ Calculate arrivals and departures ---
  const departures = d3.rollup(
    trips,
    (v) => v.length,
    (d) => d.start_station_id
  );
  const arrivals = d3.rollup(
    trips,
    (v) => v.length,
    (d) => d.end_station_id
  );

  // --- 6️⃣ Attach traffic data to stations ---
  stations = stations.map((s) => {
    const id = s.short_name;
    s.arrivals = arrivals.get(id) ?? 0;
    s.departures = departures.get(id) ?? 0;
    s.totalTraffic = s.arrivals + s.departures;
    return s;
  });

  console.log("✅ Added traffic fields:", stations.slice(0, 5));

  // --- 7️⃣ Create SVG overlay ---
  d3.select("#map").select("svg").remove();
  const svg = d3
    .select("#map")
    .append("svg")
    .style("position", "absolute")
    .style("top", 0)
    .style("left", 0)
    .style("width", "100%")
    .style("height", "100%")
    .style("z-index", 10)
    .style("pointer-events", "none");

  // --- 8️⃣ Define size scale based on total traffic ---
  const radiusScale = d3
    .scaleSqrt()
    .domain([0, d3.max(stations, (d) => d.totalTraffic)])
    .range([0, 25]);

  // --- 9️⃣ Draw circles ---
  const circles = svg
    .selectAll("circle")
    .data(stations)
    .enter()
    .append("circle")
    .attr("fill", "steelblue")
    .attr("stroke", "white")
    .attr("fill-opacity", 0.6)
    .attr("stroke-width", 1)
    .style("pointer-events", "auto") // for tooltips
    .each(function (d) {
      d3.select(this)
        .append("title")
        .text(
          `${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`
        );
    });

  // --- 🔟 Update positions and radius ---
  function updatePositions() {
    circles
      .attr("cx", (d) => getCoords(d).cx)
      .attr("cy", (d) => getCoords(d).cy)
      .attr("r", (d) => radiusScale(d.totalTraffic));
  }

  updatePositions();
  map.on("move", updatePositions);
  map.on("zoom", updatePositions);
  map.on("resize", updatePositions);
  map.on("moveend", updatePositions);

  console.log("🚴‍♀️ Bike traffic visualization complete!");
});