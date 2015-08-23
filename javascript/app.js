//  TODO:
//  [!!]  FIX ViewModel property definition bug
//  [  ]  Ensure appropriate separation of concerns via MVVM paradigm
//  [!!]  Encapsulate defaults in a model object
//  [!!]  Add map markers
//  [!!]  Create (4) default objects with minimum information 
//  [  ]  Add searching and filtering functionality (what does this mean???)
//  [!!]  Implement a list view of identified locations
//  [  ]  Wire clicking of map markers to additional via AJAX requests
//  [  ]  Add a README!!!
//  [  ]  Comment and clean up code
//  [  ]  Make the app look pretty . . . . 

(function() {
	"use strict";

	//  Store commonly used constants in this object
	var defaults = {

		$mapCanvas: $("#map-canvas")[0],  //  Reference to map-canvas div
		lat: 37.56, //  Lattitude for Downtown San Mateo
		lng: -122.32,  //  Longitude for Downtown San Mateo
		
		//  Prototype object to be populated with properties of JSON response from Foursquare request
		Place: function ( name, lat, lng, phone, url ) {
			this.name = name;
			this.lat = lat;
			this.lng = lng;
			this.phone = phone;
			this.url = url;
		},
	};	

	//  Holds ViewModel functionality
	function neighborhoodViewModel() {
		var self = this;  //  Allows 'this' to be used within nested scopes
		this.place = ko.observable();  //  Bound to the place that the user searches for later use in functions 
		this.results = ko.observableArray();  //  Tracks the places in an observable 'results' array 
		this.markers = ko.observableArray();

		//  AJAX request to Foursquare bound to user clicking 'Search' button
		this.getPlace = function() { 
			$.getJSON("https://api.foursquare.com/v2/venues/search?client_id=DFMQLSBHUH2LQAQ3DQYSNSAR3TYCNHQJ3DEIHVKSMK0KBGPJ&client_secret=3J5U50Y3HOGLN3DJDHROLSZB4FBHEZCNW1P3VWHANK4KRNYO&v=20130815&ll=" + 
			defaults.lat + "," + defaults.lng + "&query=" + self.place(), function( data ) {
				var places = data.response.venues;  //  Pulls the array of search results from the JSON response 
				console.log( places );  //  Test . . . . 
				//  Populates 'results' array with venue information stored in 'Place' prototype 
				self.results.removeAll();  //  Clears previous results
				$.each( places, function( index, item ) {
					var place = new defaults.Place(item.name, item.location.lat, item.location.lng, item.contact.phone, item.url);
					self.results.push(place);
				});
			console.log(self.results());
			self.initializeMap(self.results());
			});
			return false   //  DON'T refresh the page!!!
		};

		this.addMarkers = function( places, map ) {

  		// The function below is courtesty of a Google Developers example
			self.markers.removeAll(); //  Clears previous markers
			var markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			var labelIndex = 0;
			
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
					center: new google.maps.LatLng(defaults.lat, defaults.lng),
					zoom: 14
				};
			
			var map = new google.maps.Map( defaults.$mapCanvas, mapOptions );
			
			if ( results ) {
				console.log(results);
				self.addMarkers(results, map);
			};
		}

		this.getInfo = function() {
			console.log("Info retrieved");
		};

		//  Test function below to add default markers to database and map
		this.addDefaultMarkers = function ( defaults ) {
			self.initializeMap( defaults );
		}
    };
    //  Open up the map at the default location and zoom
    
    var render = function() {
    	var neighborhood = new neighborhoodViewModel(),
    		mydata = JSON.parse(defaultPlaces);
    	ko.applyBindings( neighborhood ); 
	    console.log(mydata);
	    neighborhood.addDefaultMarkers(mydata);
    }
    render();
})();