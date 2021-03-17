$(document).ready(function(){
	var map = L.map('map').setView([50.93564,-1.39614], 17);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
		attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
		maxZoom: 19
	}).addTo(map);


	var state;
	setState( "sol" );
	var au = {
		"Sun":	0,
		"Size of Earth":	0.00004,
		"Earth to Moon":	0.002,
		"Size of Sun":	0.047,
		"Mercury":	0.39,
		"Venus":	0.723,
		"Earth":	1,
		"Mars":	1.524,
		"Ceres":	2.8,
		"Jupiter":	5.02,
		"Saturn":	9.5,
		"Uranus":	19.18,
		"Neptune":	30.06,
		"Pluto":	39.53,
		"Distance to Alpha Centauri":	276173.78
	};
	var lineStyles = { 
		"Mercury":	{ weight: 5, fill: false, color: "#888888" },
		"Venus":	{ weight: 5, fill: false, color: "#ffffcc" },
		"Earth":	{ weight: 5, fill: false, color: "#0000cc" },
		"Mars":		{ weight: 5, fill: false, color: "#ff6666" },
		"Ceres":	{ weight: 5, fill: false, color: "#888888", dashArray: [ 3,10 ] },
		"Jupiter":	{ weight: 5, fill: false, color: "#999900" },
		"Saturn":	{ weight: 5, fill: false, color: "#ffffcc" },
		"Uranus":	{ weight: 5, fill: false, color: "#99ccff" },
		"Neptune":	{ weight: 5, fill: false, color: "#9999ff" },
		"Pluto":	{ weight: 5, fill: false, color: "#b69b85" }
	};
	var planets = [ "Sun", "Mercury", "Venus", "Earth", "Mars", "Ceres", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto" ];
	var extras = [ "Size of Earth","Earth to Moon","Size of Sun","Distance to Alpha Centauri" ];
	var markers = {};
	var circles = {};

	for( var i=0; i<planets.length; ++i ) {
		var iconData = {
			iconUrl: 'images/'+planets[i]+'.png',
			iconSize: [33, 44],
			iconAnchor: [16, 44],
			popupAnchor: [-3, -50],
			shadowUrl: 'images/Shadow.png',
			shadowSize: [58, 32],
			shadowAnchor: [4, 31]
		};
		if( planets[i]=="Saturn" ) {
			iconData.iconSize = [50,44];
			iconData.iconAnchor = [25,44];
		}
		markers[planets[i]] = L.marker([0,0],{draggable:true,icon:L.icon(iconData)});
		circles[planets[i]] = L.circle([0,0],1,lineStyles[planets[i]] );
		markers[planets[i]].bindTooltip( planets[i]+" - "+au[planets[i]]+"AU" , {offset: [20,-22]});
		let thisPlanet = planets[i];
		markers[planets[i]].on('drag',(e)=>{ movePlanet(thisPlanet, e.latlng ); });
		markers[planets[i]].on('dragend',(e)=>{ setHash(); } );
		
		$('#solTable').append( $("<tr><td>"+planets[i]+"</td><td>"+makenum(au[planets[i]],null,2)+"</td><td class='solDist' data-au='"+au[planets[i]]+"'>-</td></tr>" ));
	}
	for( var i=0; i<extras.length; ++i ) {
		$('#solTable').append( $("<tr><td>"+extras[i]+"</td><td>"+makenum(au[extras[i]],null,2)+"</td><td class='solDist' data-au='"+au[extras[i]]+"'>-</td></tr>" ));
	}

	$('#reset').on("click", ()=>{ 
		setState( "sol" );
		removeFromMap();
		clearHash();
	});


	function removeFromMap() {
		for( var i=0; i<planets.length; ++i ) {
			markers[planets[i]].remove();
			circles[planets[i]].remove();
		}
	}
	function addToMap() {
		// does not add Sun as that's added first
		for( var i=1; i<planets.length; ++i ) {
			markers[planets[i]].addTo(map);
			circles[planets[i]].addTo(map);
		}
	}
	
	function makenum( num, a, b ) {
		var i = ""+Math.floor(num);
		var f = ""+Math.floor((num-i)*Math.pow(10,b));
		if( i==0 ) { return num; }
		if( a ) { while( i.length < a ) { i="0"+i; } }
		if( b ) { while( f.length < b ) { f+="0"; } }
		return i+"."+f;
	}
	function humanDistance(m) {
		if( m<0.0001 ) { return makenum( m*1000000, null, 2 )+" μm"; }
		if( m<0.01) { return Math.round( m*10000 )/10+" mm"; }
		if( m<0.1) { return Math.round( m*1000 )+" mm"; }
		if( m<1 ) { return Math.round( m*100 )+" cm"; }
		if( m<100 ) { return Math.round( m*10 )/10+" m"; }
		if( m<1000 ) { return Math.round( m )+" m"; }
		if( m<10000 ) { return Math.round( m/100 )/10+"km"; }
		return Math.round( m/1000 )+" Km"; 
	}	
	
	function setState( newState ) {
		$('.state').hide();
		$('.state-'+newState).show();
		state = newState;
	}

	// thanks to https://stackoverflow.com/questions/43167417/calculate-distance-between-two-points-in-leaflet
	function getDistance(origin, destination) {
		// return distance in meters
		var lon1 = toRadian(origin[1]),
			lat1 = toRadian(origin[0]),
			lon2 = toRadian(destination[1]),
			lat2 = toRadian(destination[0]);
	
		var deltaLat = lat2 - lat1;
		var deltaLon = lon2 - lon1;
	
		var a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
		var c = 2 * Math.asin(Math.sqrt(a));
		var EARTH_RADIUS = 6371;
		return c * EARTH_RADIUS * 1000;
	}
	function toRadian(degree) {
		return degree*Math.PI/180;
	}
	function onMapClick(e) 
	{ 
		// simulated events cause double events on IOS & Safari
		if( e.originalEvent._simulated ) { return; }
		var RES=100000; // rounding 
		var lat = Math.round(e.latlng.lat*RES)/RES;
		var lng = Math.round(e.latlng.lng*RES)/RES;
		if( state=='sol' ) { 
			markers["Sun"].setLatLng( [lat,lng] ).addTo(map);
			setState( "earth" );
			return;
		}
		if( state=='earth' ) { 
			addToMap();
			movePlanet( "Earth", {lat:lat,lng:lng} );
			movePlanet( "Earth", {lat:lat,lng:lng} );
			setState( "main" );
			fitPlanets();
			setHash();
			return;
		}
	}
	function movePlanet( planet, pos ) {
                if( planet == "Sun" ) { 
			movePlanet( "Pluto", markers["Pluto"].getLatLng() );
			return;
		}
		var sunLL = markers["Sun"].getLatLng();
		var plutoLL = markers["Pluto"].getLatLng();

		var latRatio = (pos.lat-sunLL.lat)/au[planet];
		var lngRatio = (pos.lng-sunLL.lng)/au[planet];
		var auToMeters = getDistance([sunLL.lat,sunLL.lng], [plutoLL.lat,plutoLL.lng] )/au["Pluto"];

		for( i=1; i<planets.length; ++i ) {
			var ll = [sunLL.lat + au[planets[i]]*latRatio, sunLL.lng + au[planets[i]]*lngRatio];
			markers[planets[i]].setLatLng( ll );
			circles[planets[i]].setLatLng( markers["Sun"].getLatLng() ).setRadius( au[planets[i]]*auToMeters );
		}
		$(".solDist").each( (i,e)=>{
			var au = $(e).data('au');
			$(e).text( humanDistance(au*auToMeters) );
		});	
	}

	function setHash() {
		sunLL = markers["Sun"].getLatLng();
		earthLL = markers["Earth"].getLatLng();
    		window.location.hash = '#'+sunLL.lat+","+sunLL.lng+";"+earthLL.lat+","+earthLL.lng;
	}
	function clearHash() {
    		window.location.hash = '';
	}
	function updateFromHash() {
		var hash = window.location.hash.replace( /^#/, '' );
		if( hash ) {
			var codes = hash.split( /;/ );
			var sunLL = codes[0].split( /,/ );
			var earthLL = codes[1].split( /,/ );
			setState( "main" );
			markers["Sun"].setLatLng( sunLL ).addTo(map);
			addToMap();
			// run move planet twice. The first time positions things and the second time
			// has the correct positions to work out the numbers in the table
			movePlanet( "Earth",{lat:earthLL[0],lng:earthLL[1]} );
			movePlanet( "Earth",{lat:earthLL[0],lng:earthLL[1]} );
			fitPlanets();
		}
	}

	function fitPlanets() {
		var p1 = markers["Sun"].getLatLng();
		var p2 = markers["Pluto"].getLatLng();
		var bounds = L.latLngBounds( [p1.lat,p1.lng],[p2.lat,p2.lng] );
		map.fitBounds( bounds, { paddingBottomRight:[250,0] } );
	}

	map.whenReady( ()=>{ updateFromHash(); } );

	map.on('click', onMapClick);
});
