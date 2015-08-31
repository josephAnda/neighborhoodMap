//  TODO:
//  [  ]  Ensure appropriate separation of concerns via MVVM paradigm
//  [!!]  Wire clicking of list items to display Wiki info
//  [!!]  Create true/false index property for each place
//  [  ]  Display NYT information via nyt parameter
//  [  ]  Comment and clean up code
//  [  ]  Make the app look pretty . . . . 
//  Extended note to self:  Ultimately, the only thing left to do to really clean up this app is to figure out A)  How 
//  to make it all fit together a little more smoothly and B) Wire the clicking of list entries to the AJAX requests  

(function() {
	"use strict";

	//  Store commonly used constants in this object
	var defaults = {

		$mapCanvas: $("#map-canvas")[0],  //  Reference to map-canvas div
		lat: 37.56, //  Lattitude for Downtown San Mateo
		lng: -122.32,  //  Longitude for Downtown San Mateo
		
		//  Prototype object to be populated with properties of JSON response from Foursquare request
		Place: function ( name, lat, lng, phone, url, category, index ) {
			this.name = name;
			this.lat = lat;
			this.lng = lng;
			this.phone = phone;
			this.url = url;
			this.category = category;
			this.index = index;
			this.wiki = "static";
			this.nyt = "null";
			
		},
	};	

	//  Holds ViewModel functionality
	function neighborhoodViewModel() {
		var self = this;  //  Allows 'this' to be used within nested scopes
		
		this.place = ko.observable();  //  Bound to the place that the user searches for later use in functions 
		this.results = ko.observableArray();  //  Tracks the places in an observable 'results' array 
		this.markers = ko.observableArray();
		this.categories = ko.observableArray(["Coffee Shops", "Barber Shops", "Pizza Places"]);
		this.tests = ko.observableArray();
		this.infoVisible = ko.observableArray();
		this.wikiData = ko.observable("init");
		this.nytData = ko.observable("null");
		
		this.toggleVisible = function( place ) {
			
			self.infoVisible.removeAll();
			self.infoVisible.push(place.name);
				console.log(self.infoVisible());
			
		};
	

		//  AJAX request to Foursquare bound to user clicking 'Search' button
		this.getPlace = function() { 
			$.getJSON("https://api.foursquare.com/v2/venues/search?client_id=DFMQLSBHUH2LQAQ3DQYSNSAR3TYCNHQJ3DEIHVKSMK0KBGPJ&client_secret=3J5U50Y3HOGLN3DJDHROLSZB4FBHEZCNW1P3VWHANK4KRNYO&v=20130815&ll=" + 
			defaults.lat + "," + defaults.lng + "&query=" + self.place(), function( data ) {
				var places = data.response.venues;  //  Pulls the array of search results from the JSON response 
				//console.log( places );  //  Test . . . . 
				//  Populates 'results' array with venue information stored in 'Place' prototype 
				self.results.removeAll();  //  Clears previous results
				self.infoVisible.removeAll(); 
				$.each( places, function( index, item ) {
					var place = new defaults.Place(item.name, item.location.lat, item.location.lng, item.contact.phone, item.url, item.categories[0].pluralName);
					var i = 0;
					self.results.push(place);
					//self.infoVisible.push(i);
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
				if (self.categories.indexOf(item.category) != -1) {  //  Only displays marker if the category is selected
					var marker = new google.maps.Marker({
	    				position: {lat: item.lat, lng: item.lng},
	    				label: markerLabels[labelIndex++ % markerLabels.length],
	    				map: map
	  				});
	  				var infowindow = new google.maps.InfoWindow({
    					content: '<p>' + item.name + '</p>'
  					});
  					marker.addListener('click', function() {
					    infowindow.open(map, marker);
					});
  					self.markers.push(marker);
  				}
			})
  			//console.log(self.markers());
		};
		this.getNYTimes = function ( spot ) {
			var key = "&api-key=6b539ed4808bc69e6e974a036e2de9f2:1:72423609";
	    	var nytimesApiUrl = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + spot.name + key;
	    	$.getJSON( nytimesApiUrl  , function( data ) {
	    		var articles = data.response.docs;
	    		var tags = [];
	    		$.each( articles, function( index, article) {
	    			var elem = "<li class='article'>" + "<a href=" + article.web_url+">" + article.headline.main + 
                	"</a>" + "<p>" + article.lead_paragraph +"</p>" + "</li>";
	    			tags.push( elem );
	    			spot.nyt = elem;
                	//$nytElem.append(tags[index]);
            	});
            	self.nytData(tags[0]);
            	console.log(tags);
            	console.log(data);
	    	}).error(function(e){
	        	console.log('New York Times Articles Could Not Be Loaded');
	        });
	    }
	
		this.getWiki = function( spot ) {
			var remoteUrlWithOrigin = "https://en.wikipedia.org/w/api.php";
			var queryData = {
				format: "json",
				action: "query",
				list: "search",
				srsearch: spot.name,
				srwhat: "text"
			};

			$.ajax( {
			    url: remoteUrlWithOrigin,
			    data: queryData,
			    dataType: 'jsonp',
			    type: 'POST',
			    headers: { 'Api-User-Agent': 'Joseph Anda -- orenmurasaki@gmail.com' },
			    success: function(data) {
			    	if(data.query.search[0].snippet) {
			    		self.wikiData(data.query.search[0].snippet);

			    	};
			    	console.log("test");
			    	console.log(data.query.search[0].snippet.toString());
			    	console.log(data);
			       
			       
			}
} );
		};
		
		this.initializeMap = function( results ) {
			var mapOptions = {
					center: new google.maps.LatLng(defaults.lat, defaults.lng),
					zoom: 13
				};
			
			var map = new google.maps.Map( defaults.$mapCanvas, mapOptions );
			
			if ( results ) {
				//console.log(results);
				self.addMarkers(results, map);
			};
		};

		this.getInfo = function() {
			console.log(this.name);
		};

	
		this.filter = function() {
			console.log(self.categories());
		};
		//  Test function below to add default markers to database and map
		this.addDefaultMarkers = function ( defaults ) {
			self.initializeMap( defaults );
		}
    };
    //  Open up the map at the default location and zoom
    
    var render = (function() {
    	var hood = new neighborhoodViewModel();
    	var	myData = JSON.parse(defaultPlaces);

    	ko.applyBindings( hood ); 
	    hood.addDefaultMarkers(myData);
	    //console.log(hood.categories());
    })();
    //render();
})();