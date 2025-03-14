/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
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


/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
fetch("https://github.com/smith-lg/ggr472-lab4/blob/f8205321fb8cdc020c628e527c9dcd13ca28918b/data/pedcyc_collision_06-21.geojson")

//      Use the fetch method to access the GeoJSON from your online repository
.then(response => response.json())
    .then(data => {
        // Add the fetched data as a source
        map.addSource('fetched-data', {
            type: 'geojson',
            data: data
            });
        })
//      Convert the response to JSON format and then store the response in your new variable
map.on('load', function () {
    map.addLayer({
        id: 'fetched-layer',
        type: 'circle', // You can use 'fill', 'line', 'symbol', etc.
        source: {
            type: 'geojson',
            data: 'https://github.com/smith-lg/ggr472-lab4/blob/f8205321fb8cdc020c628e527c9dcd13ca28918b/data/pedcyc_collision_06-21.geojson'
        },
        paint: {
            'circle-radius': 6,
            'circle-color': '#FF5733'
        }
    });
});



/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function
//      **Option: You may want to consider how to increase the size of your bbox to enable greater geog coverage of your hexgrid
//                Consider return types from different turf functions and required argument types carefully here



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


