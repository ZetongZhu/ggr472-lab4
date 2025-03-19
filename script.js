/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

// Ensure Turf.js is loaded
if (typeof turf === 'undefined') {
    console.error("Turf.js is not loaded! Make sure you have included the CDN in index.html.");
}

// Define Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiemV0b25nemh1IiwiYSI6ImNtNmllamU0ejAwMzcya3BvaHl4cHdyNTEifQ.8DeoWcpHZR2z0XiEGvRoJw';

// Initialize Mapbox map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/zetongzhu/cm8949u9h005k01s53dp678j4',
    center: [-79.39, 43.65],
    zoom: 11
});

// Add zoom and rotation controls
map.addControl(new mapboxgl.NavigationControl());

// Fetch GeoJSON data
fetch("https://raw.githubusercontent.com/ZetongZhu/ggr472-lab4/main/data/pedcyc_collision_06-21.geojson")
    .then(response => response.json())
    .then(data => {
        window.fetchedData = data; // Store data globally for debugging
        console.log("Fetched collision data:", data);

        map.addSource('fetched-data', {
            type: 'geojson',
            data: data
        });

        map.addLayer({
            id: 'fetched-layer',
            type: 'circle',
            source: 'fetched-data',
            paint: {
                'circle-radius': 4,
                'circle-color': '#1E90FF',
                'circle-stroke-width': 0.8,
                'circle-stroke-color': '#ffffff'
            }
        });

        generateHexGrid(data);
    })
    .catch(error => console.error('Error fetching data:', error));

/*--------------------------------------------------------------------
Step 4: GENERATE HEX GRID
--------------------------------------------------------------------*/
function generateHexGrid(data) {
    console.log("Generating hex grid...");

    if (!data || !data.features) {
        console.error("Invalid GeoJSON data:", data);
        return;
    }

    const envelopeFeature = turf.envelope(data);
    const bboxArray = turf.bbox(envelopeFeature);
    console.log("Bounding Box Array:", bboxArray);

    const expandedBboxFeature = turf.transformScale(envelopeFeature, 1.1);
    const expandedBboxArray = turf.bbox(expandedBboxFeature);
    console.log("Expanded Bounding Box:", expandedBboxArray);

    // Generate hex grid
    const hexGrid = turf.hexGrid(expandedBboxArray, 0.5, { units: 'kilometers' });
    console.log("Generated HexGrid:", hexGrid);

    if (hexGrid.features.length === 0) {
        console.error("HexGrid is empty! Check bbox format and data.");
        return;
    }

    // Aggregate data
    const collected = turf.collect(hexGrid, data, 'OBJECTID', 'collision_ids');
    console.log("Aggregated HexGrid:", collected);

    let maxCollisions = 0;
    collected.features.forEach(feature => {
        feature.properties.COUNT = feature.properties.collision_ids ? feature.properties.collision_ids.length : 0;
        maxCollisions = Math.max(maxCollisions, feature.properties.COUNT);
    });

    // Add hex grid layer
    map.addSource('hexgrid', {
        type: 'geojson',
        data: collected
    });

    map.addLayer({
        id: 'hexgrid-layer',
        type: 'fill',
        source: 'hexgrid',
        paint: {
            'fill-color': [
                'interpolate', ['linear'], ['get', 'COUNT'],
                0, 'rgba(0, 0, 0, 0)',
                maxCollisions * 0.1, '#fdbb84',
                maxCollisions * 0.3, '#fc8d59',
                maxCollisions * 0.5, '#e34a33',
                maxCollisions * 0.7, '#b30000',
                maxCollisions, '#7f0f0f'
            ],
            'fill-opacity': [
                'case',
                ['==', ['get', 'COUNT'], 0], 0,
                0.7
            ]
        }
    });

    map.addSource('bounding-box', {
        type: 'geojson',
        data: envelopeFeature
    });

    map.addLayer({
        id: 'bounding-box-layer',
        type: 'line',
        source: 'bounding-box',
        paint: {
            'line-color': '#0000FF',
            'line-width': 2,
            'line-dasharray': [2, 2]
        }
    });

    addLegend(maxCollisions);
}

/*--------------------------------------------------------------------
Step 5: ADD LEGEND
--------------------------------------------------------------------*/
function addLegend(maxCollisions) {
    const legend = document.createElement("div");
    legend.id = "legend";

    legend.innerHTML = `
        <strong>Collision Density</strong><br>
        <div style="background:#7f0f0f;" class="legend-color"></div> ${maxCollisions} (Highest)<br>
        <div style="background:#b30000;" class="legend-color"></div> ${Math.round(maxCollisions * 0.7)}<br>
        <div style="background:#e34a33;" class="legend-color"></div> ${Math.round(maxCollisions * 0.5)}<br>
        <div style="background:#fc8d59;" class="legend-color"></div> ${Math.round(maxCollisions * 0.3)}<br>
        <div style="background:#fdbb84;" class="legend-color"></div> ${Math.round(maxCollisions * 0.1)}<br>
        <div style="background:rgba(0, 0, 0, 0);" class="legend-color"></div> 0 (None)<br>
    `;

    document.body.appendChild(legend);
}

