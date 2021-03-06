

var TimeConverter = ( function() {
	
	var i;
	var hours = [];
	for ( i=0; i<=23; i++ ) {
		var milTime = ( i < 10 ? "0" : "") + i + "00";
		var suffx = i < 12 ? "AM" : "PM"
		
		var stdHr;
		if ( i === 0 || i === 12 ) {
			stdHr = "12:00";
		} else if ( i < 12 ) {
			stdHr = i + ":" + "00";
		} else {
			stdHr = ( i - 12 ) + ":" + "00";
		}

		var stdTime = stdHr + " " + suffx;

		var hour = {
			mil: milTime,
			std: stdTime
		}

		hours.push( hour );
	}

	return {

		getAllHours: function() {
			return hours;
		},
	
		milToStd: function( milTime ) {

			var stdTime = "";

			var milHrIn = milTime.substring( 0, 2 );
			var milMinIn = milTime.substring( 2 );

			hours.forEach( function( hour ) {
				var milHrSt = hour.mil.substring( 0, 2 );
				
				if ( milHrSt === milHrIn ) {
					stdTime = hour.std.replace( ":00", ":" + milMinIn );
					return;
				}				

			});

			return stdTime;

		},

		stdToMil: function( stdTime ) {
			for ( time in hours ) {
				if ( stdTime === time.std ) {
					return time.mil
				}
			}
		}
	}

})();

var MapModule = ( function() {
	
	var map;
	var ctaLayer;
	var markers = [];
	
	var InfoWindowFactory = ( function() {
		
		var resultHash = {};
		var current = null;

		return {
			buildListener: function( result, map, marker ) {

				/* EXAMPLE RESULT ( result )
				 * addr1: "4020 Hunting Creek Road"
				 * city: "Huntingtown"
				 * county: "Calvert"
				 * day: "Wednesday"
				 * gp_name: "Huntingtown Group"
				 * language: "English"
				 * latlong: "38.618715,-76.618352"
				 * loc_name: "Huntingtown Methodist Church"
				 * time: "1900"
				 */

				var stdHr = TimeConverter.milToStd( result.time );
				var dateTime = result.day + " @ " + stdHr;

				var type = "";
				if ( result.type !== null ) {
				
					type = result.type
					// Don't display Al-Anon
					.replace( "A", "" )
					.replace( "C", " Closed, " )
					.replace( "W", " Wheelchair, " )
					.replace( "G", " Women Only, " )
					.replace( "S", " No Court Slips, " );
		
					var lastIndexOfComma = type.lastIndexOf( "," );
					type = type.substring( 0, lastIndexOfComma );
				}
				
				var infoWindowContent = "<div class='locinfo'>";
				infoWindowContent    += "<span class='aaignum'>" + result.AAIG_num + "</span><br />";
				infoWindowContent    += "<span class='groupname'>" + result.gp_name + "</span><br />";
				infoWindowContent    += "<span class='locname'>" + result.loc_name + "</span><br />";
				infoWindowContent    += "<span class='address'>" + result.addr1 + "</span><br />";
				infoWindowContent    += "<span class='city'>" + result.city + "</span><br />";
				infoWindowContent    += "<span class='datetime'>" + dateTime + "</span><br />";
				infoWindowContent    += "<span class='language'>" + result.language + "</span><br />";
				infoWindowContent    += "<span class='type'>Meeting Types: " + type + "</span>";
				infoWindowContent    += "</div>";
				
				var latlng = result.latlong;
				if ( ! ( latlng in resultHash ) ) {
					resultHash[ latlng ] = new google.maps.InfoWindow({
						content: infoWindowContent
					});
				} 	
				
				var listener = function() {
					
					if ( current !== null ) {
						current.close();
						current = null;
					}
					
					current = resultHash[ latlng ];
					current.open( map, marker );
				}
				
				
				return listener;
			}
		};

	})();

	function initialize() {
		var mapOptions = {
			center: new google.maps.LatLng( 38.976659,-76.490282 ),
			zoom: 9
		};
		
		map = new google.maps.Map(
			document.getElementById("map-canvas"), 
			mapOptions
		);
	}

	google.maps.event.addDomListener(
		window, 
		'load', 
		initialize
	);


	return {
		getMarkers: function( params, $http ) {
			
			// TODO Set up MySQL on localhost
			var promise = $http({
				method: 'GET',
				url: 'search.php' 
				+ '?day=' + params.day 
				+ '&stime=' + params.stime 
				+ '&etime=' + params.etime
				+ '&type='  + params.type
			});

			promise.success( function( d, s, h, c) {
				
				markers.forEach( function( loadedMarker ) {
					loadedMarker.setMap( null );
				});

				var results = d.results;

				for ( result in results ) {
					var coords = result.split( ',' );
					var latlng = new google.maps.LatLng( coords[0], coords[1] );
					
					var marker = new google.maps.Marker({
						position: latlng,
						title: result.gp_name
					});
					
					marker.setMap( map );
					markers.push( marker );					
	
					var first = results[ result ][0];
					
					var listener = InfoWindowFactory.buildListener( first, map, marker );
					
					google.maps.event.addListener( marker, 'click', listener );
				
				};
			});

			promise.error( function( d, s, h, c ) {
  				alert( "Error!" ); 
			});
		}
	}

})();


function SearchController ( $scope, $http, $location ) {
	$scope.days	= [
		{ name: "Monday", value: 'mon' },
		{ name: "Tuesday", value: 'tue' },
		{ name: "Wednesday", value: 'wed' },
		{ name: "Thursday", value: 'thu'},
		{ name: "Friday", value: 'fri' },
		{ name: "Saturday", value: 'sat' },
		{ name: "Sunday", value: 'sun' }
	];

	$scope.hours = TimeConverter.getAllHours();

	$scope.types = [
		{ type: "Wheelchair", code: "W" },
		{ type: "Women Only", code: "G" },
		{ type: "Closed", code: "C" },
		{ type: "No Court Slips", code: "S" }
	];

	$scope.search = function() {

		var params = {
			day: $scope.day || 'any',
			stime: $scope.stime || 'any',
			etime: $scope.etime || 'any',
			type: $scope.type || 'any'
		}
		
		MapModule.getMarkers( params, $http );
	}

}
