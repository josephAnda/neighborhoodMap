//  TODO:
//  [!!]  Ensure appropriate separation of concerns via MVVM paradigm
//  [!!]  Animate map markers 
//  [!!]  Wire clicking of list items to display Wiki info
//  [!!]  Create true/false index property for each place
//  [  ]  Fix initial animations 
//  [  ]  Display NYT information via nyt parameter
//  [  ]  Comment and clean up code
//  [  ]  Make the app look pretty . . . . 
//  [  ]  Limit the initial markers to (1) info window
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
			this.wiki = "";
			this.nyt = "";
			
		},
	};	

	//  Holds ViewModel functionality
	function neighborhoodViewModel() {
		var self = this;  //  Allows 'this' to be used within nested scopes
		
		this.place = ko.observable();  //  Bound to the place that the user searches for later use in functions 
		this.results = ko.observableArray();  //  Tracks the places in an observable 'results' array 
		this.markers = ko.observableArray();  //  This is never used . . . TODO:  [  ]  Turn markers into accessible objects or variables 
		this.categories = ko.observableArray(["Coffee Shops", "Salons / Barber Shops", "Pizza Places", "Food Courts", "Chinese Restaurants"]);  //  observable array for checked categories
		this.tests = ko.observableArray();  //  Never used, but may be accessed in later versions 
		this.infoVisible = ko.observableArray();  //  Determines whether or not the list view shows extra AJAX info
		this.wikiData = ko.observable("Click a location in the list for more information!");  //  This changes to display the currently selected venue's wiki data
		this.nytData = ko.observable("null");  //  This changes to show the currently selected venue's Times data
		

		//  Controls the visibility of additional information in a list entry  
		this.toggleVisible = function( place ) {
			var results = [];
			results.push(place);
			self.infoVisible.removeAll();
			self.infoVisible.push(place.name);
				//console.log(self.infoVisible());
			self.initializeMap ( results );

			
		};
		//  Filters based on user query WITHOUT using an AJAX request.  If a search has been conducted, it filters based on  
		//  the ko.observable 'results() array.  If no search has been conducted (or if the observable is otherwise empty)
		//  The defaults will be used from the included json file and the query will be compared against the file's entries
		this.filter = function() {
			
			var results = [],
				places;
			//  Populate with pre-loaded defaults or with results of a prior AJAX request
			if (self.results().length > 0) { 
				places = self.results();
			} else {
				places = JSON.parse(defaultPlaces); 
			}
			//  Pushes place to 'results' array if the query is contained inside of the place's name
			$.each( places, function( index, item ) {
				if (item.name.toLowerCase().search(self.place().toLowerCase()) !== -1) {
					results.push(item);
				}
			});
			self.initializeMap( results );
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
					//var i = 0;
					self.results.push(place);
				});
			console.log(self.results());
			self.initializeMap(self.results());
			})
			.error(function() { alert("error"); });  //  Basic error handler
			return false;   //  DON'T refresh the page!!!
		};

		this.addMarkers = function( places, map ) {

  		// The function below is courtesty of a Google Developers example
			self.markers.removeAll(); //  Clears previous markers
			var markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			var labelIndex = 0;
			var infoWindowOpen = false;
			
			//  Creates map markers based on associated filter preferences
			$.each( places, function ( index, item) {
				//  This function is courtesy of a Google Developers example
				var toggleBounce = function() {
		 	 			if (marker.getAnimation() !== null) {
		    				marker.setAnimation(null);
		  				} else { 
		  					marker.setAnimation(google.maps.Animation.BOUNCE);
  						}
				}
				var openInfoWindow = function( item ) {
		  				
	  					if (!infoWindowOpen) {
	  						infowindow.open(map, marker);
	  						infoWindowOpen = true;
	  					};
  					}
				if (self.categories.indexOf(item.category) !== -1) {  //  Only displays marker if the category is selected
					var marker = new google.maps.Marker({
	    				position: {lat: item.lat, lng: item.lng},
	    				label: markerLabels[labelIndex++ % markerLabels.length],
	    				animation: google.maps.Animation.DROP,
	    				map: map
	  				});
	  				var infowindow = new google.maps.InfoWindow({
	    					content: '<p>' + item.name + '</p>' + 
	    					'<div id="wikipedia-info"></div>' + 
	    					'<div id="nyt-info"></div>'
	  				});
	  				//  Animate marker
	  				//  marker.setAnimation(google.maps.Animation.BOUNCE);
	  				//  Creates info window with AJAX info  TODO:  [!!]  Populate this with an AJAX request directly
	  				openInfoWindow( item );
  					marker.addListener('click', function() {
  						if (infowindow) {
  							infowindow.close();
  						};
					    infowindow.open(map, marker);
					    toggleBounce();
					});
					
  					self.markers.push(marker);
  				}
			})
  			//console.log(self.markers());
		};

		//  AJAX request to New York Times website 
		this.getNYTimes = function ( spot ) {
			var key = "&api-key=6b539ed4808bc69e6e974a036e2de9f2:1:72423609";
	    	var nytimesApiUrl = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + spot.name + key;
	    	var $nytDiv = $("#nyt-info");
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
            	$nytDiv.html(self.nytData());
            	console.log(tags);
            	console.log(data);
	    	}).error(function(e){
	        	console.log('New York Times Articles Could Not Be Loaded');
	        });
	    }
		
		//  Wikipedia request to New York Times website  
		this.getWiki = function( spot ) {
			var remoteUrlWithOrigin = "https://en.wikipedia.org/w/api.php";
			var queryData = {
				format: "json",
				action: "query",
				list: "search",
				srsearch: spot.name,
				srwhat: "text"
			};
			var $wikiDiv = $("#wikipedia-info");
			$.ajax( {
			    url: remoteUrlWithOrigin,
			    data: queryData,
			    dataType: 'jsonp',
			    type: 'POST',
			    headers: { 'Api-User-Agent': 'Joseph Anda -- orenmurasaki@gmail.com' },
			    //  'success' function alters the snippet and makes it the current wikiData item
			    success: function(data) {
			    	if(data.query.search[0].snippet) {
			    		self.wikiData(data.query.search[0].snippet);

			    	};
			    	console.log("test");
			    	console.log(data.query.search[0].snippet.toString());
			    	console.log(data);
			    	$wikiDiv.html(self.wikiData());       
				}
			});
		};
		
		//  opens up the map for the first time 
		this.initializeMap = function( results ) {
			var mapOptions = {
					center: new google.maps.LatLng(defaults.lat, defaults.lng),
					zoom: 13
				};
			
			var map = new google.maps.Map( defaults.$mapCanvas, mapOptions );
			
			//  Prevents undefined error  
			if ( results ) {
				//console.log(results);
				self.addMarkers(results, map);
			};
		};
		//  Test function
		this.getInfo = function() {
			console.log(this.name);
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
    
})();