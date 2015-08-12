//  TODO:
//  [  ]  Ensure appropriate separation of concerns via MVVM paradigm
//  [  ]  Add map markers
//  [  ]  Add searching and filtering functionality (what does this mean???)
//  [  ]  Implement a list view of identified locations
//  [  ]  Wire clicking of map markers to additional via AJAX requests
//  [  ]  Add a README!!!
//  [  ]  Comment and clean up code
//  [  ]  Make the app look pretty . . . . 

(function() {
	"use strict";

	//  Loads initial map
	var $mapCanvas = $("#map-canvas")[0];  //  Reference to map-canvas div

	function initializeMap() {
		var mapOptions = {
  				center: new google.maps.LatLng(37.56, -122.32),
  				zoom: 7
			};
		var map = new google.maps.Map( $mapCanvas, mapOptions);
		
	}

	//  Holds ViewModel functionality
	function neighborhoodViewModel() {
		var self = this;
		this.address = ko.observable();  //  Bound to the address that the user inputs
		this.place = ko.observable();  //  Bound to the place that the user searches for 
		this.markers = ko.observableArray();  //  Tracks the markers 

		this.getPlace = function() { 
			if (!self.address()) { 
				alert("Please search an address to enable 'Places' search") 
			} /*else {
				$.get();   //  Insert URL here for Foursquare AJAX request*/
			return false   //  DON'T refresh the page!!!
		};

        this.getMap = function() {
        	if (self.markers != 0) { self.markers.removeAll() };  //  Resets marker list when the page loads
            $.get( "https://maps.googleapis.com/maps/api/geocode/json?address=" + self.address() + "&key=AIzaSyDMBshK9P3JbIcC-prwrJoeV36aYqVd4zU&sensor=true", 
            
            function( response ) {
	    		var lat = response.results[0].geometry.location.lat;  //  grabs lattitude from first geocoded response
	    		var lng = response.results[0].geometry.location.lng;  //  grabs longitutde from first geocoded response
	    		var mapOptions = {
	    			center: new google.maps.LatLng(lat, lng),
	    			zoom: 15
	    		}; 
	    		//  creates required default options for map object based on AJAX response's location
	    		var map = new google.maps.Map( $mapCanvas, mapOptions );
	    		//  console.log( response );
	    		google.maps.event.addListener(map, 'click', function(event) {
	    			addMarker(event.latLng, map);
		  		});
		  		// The function below is courtesty of a Google Developers example
		  		// Each marker is labeled with a single alphabetical character.
				var markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				var labelIndex = 0;

		  		function addMarker(location, map) {
		  		// Add the marker at the clicked location, and add the next-available label
		  		// from the array of alphabetical characters.
		  			var marker = new google.maps.Marker({
		    			position: location,
		    			label: markerLabels[labelIndex++ % markerLabels.length],
		    			map: map
		  			});
		  			self.markers.push(marker);
		  			console.log(self.markers());
				}
			});

        }
        
    };

    //  Open up the map at the default location and zoom
    initializeMap();

    //  Bind the ViewModel to the html
    ko.applyBindings( new neighborhoodViewModel() );
})();