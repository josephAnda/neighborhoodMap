//  TODO:
//  [  ]  FIX ViewModel property definition bug
//  [  ]  Ensure appropriate separation of concerns via MVVM paradigm
//  [  ]  Encapsulate defaults in a model object
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
	var lat = 37.56; //  Lattitude for Downtown San Mateo
	var lng = -122.32;  //  Longitude for Downtown San Mateo


	//  Prototype object to be populated with properties of JSON response from Foursquare request
	function Place( name, lat, lng, phone, url ) {
		this.name = name;
		this.lat = lat;
		this.lng = lng;
		this.phone = phone;
		this.url = url;
	}

	//  Default points of interest, fallbacks if AJAX request fails
	var Places = [{
		name: "name",
		lattitude:  0,
		longitude:  0,
		contact:  '000-000-0000',
		url: ""
	},
	{
		name: "name",
		lattitude:  0,
		longitude:  0,
		contact:  '000-000-0000',
		url: ""

	}];
		
	
	function initializeMap( results ) {
		var mapOptions = {
					center: new google.maps.LatLng(lat, lng),
					zoom: 15
			};
		var map = new google.maps.Map( $mapCanvas, mapOptions );
		if ( results ) {
			//console.log(neighborhoodViewModel());  //  <--- Tells me that it can't set 'place' property of 'undefined' . . . .
			console.log(results);
			//neighborhoodViewModel().addMarkers(places, map);
		};
		
	}
	

	//  Holds ViewModel functionality
	function neighborhoodViewModel() {
		var self = this;  //  Allows 'this' to be used within nested scopes
		this.place = ko.observable();  //  Bound to the place that the user searches for later use in functions 
		this.results = ko.observableArray();  //  Tracks the places in an observable 'results' array 
		this.markers = ko.observableArray();
		//  Creates new Google map object

		//  AJAX request to Foursquare bound to user clicking 'Search' button
		this.getPlace = function() { 
			$.getJSON("https://api.foursquare.com/v2/venues/search?client_id=DFMQLSBHUH2LQAQ3DQYSNSAR3TYCNHQJ3DEIHVKSMK0KBGPJ&client_secret=3J5U50Y3HOGLN3DJDHROLSZB4FBHEZCNW1P3VWHANK4KRNYO&v=20130815&ll=" + 
			lat + "," + lng + "&query=" + self.place(), function( data ) {
				
				var places = data.response.venues;  //  Pulls the array of search results from the JSON response 
				console.log( places );  //  Test . . . . 
				
				//  Populates 'results' array with venue information stored in 'Place' prototype 
				self.results.removeAll();  //  Clears previous results
				$.each( places, function( index, item ) {
					var place = new Place(item.name, item.location.lat, item.location.lng, item.contact.phone, item.url);
					self.results.push(place);
					
				});
				  //  Test . . . 
				
			console.log(self.results());
			self.initializeMap(self.results());
			});
			
			
			return false   //  DON'T refresh the page!!!
		};

		this.addMarkers = function( places, map ) {
  		// Add the marker at the clicked location, and add the next-available label
  		// from the array of alphabetical characters.
  		// The function below is courtesty of a Google Developers example
		// Each marker is labeled with a single alphabetical character.
			var markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			var labelIndex = 0;
			self.markers.removeAll(); //  Clears previous markers
			$.each( places, function ( index, item) {
				var marker = new google.maps.Marker({
    				position: {lat: item.lat, lng: item.lng},
    				label: markerLabels[labelIndex++ % markerLabels.length],
    				map: map
  				});
  			self.markers.push(marker);


			})
  			
  			console.log(self.markers());
		};

		this.initializeMap = function( results ) {
			var mapOptions = {
						center: new google.maps.LatLng(lat, lng),
						zoom: 15
				};
			var map = new google.maps.Map( $mapCanvas, mapOptions );
			if ( results ) {
				console.log(results);
				self.addMarkers(results, map);
			};
		
		}
		/*
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

		  		
			});


        }
        */
        
    };

    //  Open up the map at the default location and zoom
    new neighborhoodViewModel().initializeMap();

    //  Bind the ViewModel to the html
    ko.applyBindings( new neighborhoodViewModel() );
    
    
    
})();