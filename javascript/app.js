//  TODO:
//  [!!]  Render a list initially that matches the default markers
//  [!!]  Turn the map into a background element or put the text in a scrollable box for overflow
//  [  ]  Fix markers
//		  [  ]  Have markers labels move with animation
//		  [!!]  Automate the cessation of animation (eliminate the need to click to make it stop)
//		  [  ]  De-couple the AJAX info from list clicking, make it so the AJAX info is available for info window immediately
//  [!!]  Provide data about what the list view info represents (and remove reference to list view from info window)
//  [!!]  " ... the "search function" needs to perform like your "filter markers" function. "
//  [!!]  The search function should filter the list down as you type into it (try using 'visible' binding)

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
		
		this.place = ko.observable("");  //  Bound to the place that the user searches for later use in functions 
		this.results = ko.observableArray();  //  Tracks the places in an observable 'results' array 
		this.markers = ko.observableArray();  //  This is never used . . . TODO:  [  ]  Turn markers into accessible objects or variables 
		this.categories = ko.observableArray(["Coffee Shops", "Salons / Barber Shops", "Pizza Places", "Food Courts", "Chinese Restaurants"]);  //  observable array for checked categories
		this.tests = ko.observableArray();  //  Never used, but may be accessed in later versions 
		this.infoVisible = ko.observableArray();  //  Determines whether or not the list view shows extra AJAX info
		this.wikiData = ko.observable("Click a location in the list for more information!");  //  This changes to display the currently selected venue's wiki data
		this.nytData = ko.observable("null");  //  This changes to show the currently selected venue's Times data
		
		//  Generates a map with the associated markers 
		this.initializeMap = function( results ) {
			var mapOptions = {
					center: new google.maps.LatLng(defaults.lat, defaults.lng),
					zoom: 13
				};
			
			var map = new google.maps.Map( defaults.$mapCanvas, mapOptions );
			
			if ( results ) {
				self.addMarkers(results, map);
			};
		};

		//  Generates Google Map markers
		this.addMarkers = function( places, map ) {

			self.markers.removeAll(); 
			var markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			var labelIndex = 0;
			var infowindow = new google.maps.InfoWindow({
	    					content: ""
	  				});
			var infoWindowOpen = false;
			
			//  Creates map markers based on associated user query 
			$.each( places, function ( index, item) {
				//  This function is courtesy of a Google Developers example for animation 
				var toggleBounce = function() {
		 	 			if (marker.getAnimation() !== null) {
		    				marker.setAnimation(null);
		  				} else { 
		  					marker.setAnimation(google.maps.Animation.BOUNCE);
		  					setTimeout(function(){ marker.setAnimation(null); }, 3000);  //  Stops animation
  						}
				}
				var openInfoWindow = function( item ) {
		  				
	  					if (!infoWindowOpen) {
	  						infowindow.open(map, marker);
	  						infoWindowOpen = true;
	  					};
  					}
  				//  Only displays marker if the category is selected
				if (self.categories.indexOf(item.category) !== -1) {  
					var marker = new google.maps.Marker({
	    				position: {lat: item.lat, lng: item.lng},
	    				//TODO  [  ]  Animate the label as well as the marker 
	    				//label: markerLabels[labelIndex++ % markerLabels.length],
	    				animation: google.maps.Animation.DROP,
	    				map: map
	  				});
	  				infowindow.content = '<p></p>' + 
	    					'<div id="wikipedia-info"></div>' + 
	    					'<div id="nyt-info"></div>';
	  				
	  				//  Create info window and animate marker 
	  				openInfoWindow( item );
  					marker.addListener('click', function() {
					    infowindow.open(map, marker);
					    toggleBounce();
					    self.getWiki( item );  // this is *supposed* to open up the wikipedia article associated with the info window
					});
					
  					self.markers.push(marker);
  				}
			})
  			//console.log(self.markers());
		};
		
		//  Compares query with 'results' observable and initializes a map w/out AJAX request
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

		//  Controls the visibility of additional information in a list entry  
		this.toggleVisible = function( place ) {
			var results = [];
			results.push(place);
			self.infoVisible.removeAll();
			self.infoVisible.push(place.name);
			self.initializeMap ( results );

			
		};

		//  Filters current list items as the user types
		this.filterList = function( data ) {
			console.log(data.place());
			console.log(self.results());
			$.each( self.results(), function( index, item) {
				if ((item != null) && (item.name.toLowerCase().search(data.place().toLowerCase()) !== -1)) {
					console.log('query contained in list');  //  Testing . . . 
				} else {
					self.results.remove( item );
				}
			});
			return true;
		};

		//  AJAX request to Foursquare bound to user clicking 'Get Markers' button.  Also initializes map markers
		this.getMarkers = function() { 

			$.getJSON("https://api.foursquare.com/v2/venues/search?client_id=DFMQLSBHUH2LQAQ3DQYSNSAR3TYCNHQJ3DEIHVKSMK0KBGPJ&client_secret=3J5U50Y3HOGLN3DJDHROLSZB4FBHEZCNW1P3VWHANK4KRNYO&v=20130815&ll=" + 
			defaults.lat + "," + defaults.lng + "&query=" + self.place(), function( data ) {
				var places = data.response.venues;  //  Pulls the array of search results from the JSON response 
				console.log( places );  //  Test . . . . 
				//  Populates 'results' array with venue information stored in 'Place' prototype 
				self.results.removeAll();  
				self.infoVisible.removeAll(); 
				$.each( places, function( index, item ) {
					var place = new defaults.Place(item.name, item.location.lat, item.location.lng, item.contact.phone, item.url, item.categories[0].pluralName);
					self.results.push(place);
				});
			console.log(self.results());
			self.initializeMap(self.results());
			})
			.error(function(e) { alert("error"); });  //  Experimental error handler
			return false;   //  To prevent the default action of the page refreshing 
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
				},
				error: function() { 
					alert('Could not fetch Wiki documents'); }
			});
		};
		
		
		//  Test function
		this.getInfo = function() {
			console.log(this.name);
		};


		//  Test function below to add default markers to database and map
		this.addDefaultMarkers = function ( defaults ) {
			self.initializeMap( defaults );
		}

		//  Populates list upon initial rendering 
		this.addDefaultList = function ( defaults ) {
				$.each( defaults, function( index, item ) {
					self.results.push( item );
				});
				console.log( self.results() );
			}
    };

    //  Open up the map at the default location and zoom
    var render = (function() {
    	var hood = new neighborhoodViewModel();
    	var	myData = JSON.parse(defaultPlaces);
    	ko.applyBindings( hood ); 
	    hood.addDefaultMarkers(myData);
	    hood.addDefaultList(myData);
    })();
    
})();