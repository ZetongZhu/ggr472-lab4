/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiemV0b25nemh1IiwiYSI6ImNtNmllamU0ejAwMzcya3BvaHl4cHdyNTEifQ.8DeoWcpHZR2z0XiEGvRoJw'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/zetongzhu/cm8949u9h005k01s53dp678j4',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
});

// Step 2: Fetch and display GeoJSON point data on the map
fetch("https://raw.githubusercontent.com/ZetongZhu/ggr472-lab4/main/data/pedcyc_collision_06-21.geojson")
    .then(response => response.json())
    .then(data => {
        // Store the data globally for later use in hexgrid generation
        window.fetchedData = data;

        // Add the fetched data as a source
        map.addSource('fetched-data', {
            type: 'geojson',
            data: data
        });

        // Add the layer inside the fetch callback to ensure data is loaded
        map.addLayer({
            id: 'fetched-layer',
            type: 'circle', // Change to 'circle' since 'fill' is for polygons
            source: 'fetched-data',
            paint: {
                'circle-radius': 6,
                'circle-color': '#FF5733',
                'circle-stroke-width': 1,
                'circle-stroke-color': '#000000'
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));

/*--------------------------------------------------------------------
Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
map.on('load', function () {
    console.log("Map has loaded!");

    // Use the previously fetched GeoJSON data
    const data = window.fetchedData;
    console.log("Fetched collision data:", data);

    // Step 1: Create bounding box using Turf.js envelope function
    const envelopeFeature = turf.envelope(data); // Creates a bounding box feature
    console.log("Bounding Box Feature:", envelopeFeature);

    const bboxArray = envelopeFeature.bbox; // Extracts the bbox array [minX, minY, maxX, maxY]
    console.log("Bounding Box Array:", bboxArray);

    // Step 2: Expand the bounding box by 10% using Turf.js transformScale
    const expandedBboxFeature = turf.transformScale(envelopeFeature, 1.1);
    const expandedBboxArray = expandedBboxFeature.bbox;
    console.log("Expanded Bounding Box:", expandedBboxArray);

    // Step 3: Create a hexgrid within the expanded bounding box
    const hexGrid = turf.hexGrid(expandedBboxArray, 0.5, { units: 'kilometers' });
    console.log("Generated HexGrid:", hexGrid);

    // Step 4: Aggregate collision data by hexgrid using Turf.js collect method
    const collected = turf.collect(hexGrid, data, '_id', 'collision_ids');
    console.log("Aggregated HexGrid:", collected);

    // Step 5: Add a COUNT property for each hexagon
    let maxCollisions = 0; // Track the maximum count of collisions in any hexagon
    collected.features.forEach(feature => {
        feature.properties.COUNT = feature.properties.collision_ids.length; // Count the number of collisions
        if (feature.properties.COUNT > maxCollisions) {
            maxCollisions = feature.properties.COUNT; // Update max collision count
        }
    });
    console.log("HexGrid with Collision Count:", collected);
    console.log("Max Collisions in a Hexagon:", maxCollisions);

    // Step 6: Add bounding box and hexgrid as sources
    map.addSource('bounding-box', {
        type: 'geojson',
        data: envelopeFeature // The original bounding box as a feature
    });

    map.addSource('hexgrid', {
        type: 'geojson',
        data: collected // The aggregated hexgrid with collision counts
    });

    // Step 7: Add bounding box layer (Optional: visualization purposes)
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

    // Step 8: Add hexgrid layer to map with color gradient based on collision count
    map.addLayer({
        id: 'hexgrid-layer',
        type: 'fill',
        source: 'hexgrid',
        paint: {
            'fill-color': [
                'coalesce', ['interpolate', ['linear'], ['get', 'COUNT']],
                0, '#f0f9e8',
                maxCollisions * 0.25, '#bae4bc',
                maxCollisions * 0.5, '#7bccc4',
                maxCollisions * 0.75, '#43a2ca',
                maxCollisions, '#0868ac'
            ],
            'fill-opacity': 0.6,
            'fill-outline-color': '#000000'
        }
    });
})
.catch(error => console.error('Error fetching GeoJSON:', error));





/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
//      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty



// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows


