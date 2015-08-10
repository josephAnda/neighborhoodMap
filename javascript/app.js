(function() {
	"use strict";

	//  Loads initial map
	var $mapCanvas = $("#map-canvas")[0];  //  Reference to map-canvas div

	function initializeMap() {
		var mapOptions = {
  				center: new google.maps.LatLng(-34.397, 150.644),
  				zoom: 8
			};
		var map = new google.maps.Map( $mapCanvas, mapOptions);
	}

	//  Holds ViewModel functionality
	function neighborhoodViewModel() {
		var self = this;
		this.address = ko.observable();  //  Bound to the address that the user inputs

        this.getMap = function() {
            $.get( "https://maps.googleapis.com/maps/api/geocode/json?address=" + self.address() + "&key=AIzaSyDMBshK9P3JbIcC-prwrJoeV36aYqVd4zU&sensor=true", 
            function( response ) {
	    		var lat = response.results[0].geometry.location.lat;  //  grabs lattitude from first geocoded response
	    		var lng = response.results[0].geometry.location.lng;  //  grabs longitutde from first geocoded response
	    		var mapOptions = {
	    			center: new google.maps.LatLng(lat, lng),
	    			zoom: 10
	    		}; //  creates required default options for map object based on AJAX response's location
	    		var map = new google.maps.Map( $mapCanvas, mapOptions );
    		console.log( $mapCanvas );
    		console.log( response );
			});
        }
        
    };

    //  Open up the map at the default location and zoom
    initializeMap();

    //  Bind the ViewModel to the html
    ko.applyBindings( new neighborhoodViewModel() );
})();