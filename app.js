$(function() {
    console.log( "ready!" );

    var swapArrayElements = function(arr, indexA, indexB) {
  			var temp = arr[indexA];
  			arr[indexA] = arr[indexB];
  			arr[indexB] = temp;
	};

	$.urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results==null){
			return null;
		}
		else {
			return results[1] || 0;
		}
	}

	mapboxgl.accessToken = 'REPLACE ME';


	var routeID = $.urlParam('id');
	var stravaAPI = "https://www.strava.com/api/v3/activities/" + routeID + "?callback=?";

	$.getJSON( stravaAPI, {
		access_token: "REPLACE ME"
	}).done(function( data ) {
		console.log(data.segment_efforts[0].average_heartrate);


		/* sort segments by avg HR */
		data.segment_efforts.sort(function (a, b) {
			if (a.max_heartrate > b.max_heartrate) {
    			return -1;
  			}
 			if (a.max_heartrate < b.max_heartrate) {
    			return 1;
  			}
  			return 0;
		});

		var maxHR = data.segment_efforts[0];

		var maxHRnumber = maxHR.max_heartrate;


		var newMaxHRLongitude = ((maxHR.segment.start_longitude + maxHR.segment.end_longitude)/2);
		var newMaxHRLatitude = ((maxHR.segment.start_latitude + maxHR.segment.end_latitude)/2);
		console.log(newMaxHRLatitude);

		/* sort segments by HR */


		var decodedPolyline = polyline.decode(data.map.polyline);

		/* Fix Mapboxs stupid lat lng order */
		for ( var i = 0, l = decodedPolyline.length; i < l; i++ ) {
    		swapArrayElements(decodedPolyline[i], 1, 0);
		}	

		/* Start map */
		var map = new mapboxgl.Map({
    		container: 'map',
   			style: 'mapbox://styles/mapbox/dark-v9',
    		center: decodedPolyline[0],
    		zoom: 11
		});


		map.on('load', function () {

			map.addSource("route", {
			    "type": "geojson",
			    "data": {
			        "type": "Feature",
			        "properties": {},
			        "geometry": {
			            "type": "LineString",
			            "coordinates": decodedPolyline
			        }
			    }
			});

			map.addLayer({
			    "id": "route",
			    "type": "line",
			    "source": "route",
			    "layout": {
			        "line-join": "round",
			        "line-cap": "round"
			    },
			    "paint": {
			        "line-color": "#FFF",
			        "line-width": 2
			    }
			});

			map.addSource("points", {
				"type": "geojson",
				"data": {
				    "type": "FeatureCollection",
				    "features": [{
				        "type": "Feature",
				        "geometry": {
				            "type": "Point",
				            "coordinates": [newMaxHRLongitude, newMaxHRLatitude]
				        },
				        "properties": {
				            "title": maxHRnumber				        }
				    }]
				}
			});

			map.addLayer({
				"id": "points",
				"type": "symbol",
				"source": "points",
				"layout": {
					"text-field": "{title}",
					"text-font": ["Open Sans Semibold"],
					"text-offset": [0, 0],
					"text-anchor": "top",
				},
				"paint": {
					"text-color": "#FF1744"
				}
			});


		});

		map.addControl(new mapboxgl.Navigation());

	});

});