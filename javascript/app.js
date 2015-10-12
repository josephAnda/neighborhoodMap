//  TODO
//  [!!]  Make the display responsive to different viewport sizes  (I wrapped the top form in the navbar class)
//  [!!]  Pair the list click with the window opening (functionality already exists)
//  [!!]  Fix info window bugs
//  [!!]  Write a fallback for the Google Map (in case it fails to load properly)
//  [!!]  Use marker.setVisible to alter markers in view
//  [!!]  " There are errors when trying to Get Markers for something without results like the word "chirp". 
//        Errors also happen when trying to regular search on an empty list." (Fix search bar)
//  [!!]  Simplify the search function (see reviewer comments)
//  [!!]  Integrate the foursquare info 
//  [!!]  Use setTimeout() to ensure error handler works properly in event of no internet connection (that is, 
//   	  make a decision as to how long the page will wait for the maps to load before deciding that there's an error


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
		
		this.place = ko.observable("");  //  User query in the search bar 
		this.results = ko.observableArray();  //  Stores the 'place' objects
		this.markers = ko.observableArray();  //  Stores markers
		//  Observable array for checked categories
		this.categories = ko.observableArray(["Coffee Shops", "Salons / Barber Shops", "Pizza Places", "Food Courts", "Chinese Restaurants"]); 
		this.tests = ko.observableArray();  //  Never used, but may be accessed in later versions 
		this.infoVisible = ko.observableArray();  //  Determines whether or not the list view shows extra AJAX info
		this.wikiData = ko.observable("Click a location in the list for more information!");  //  This changes to display the currently selected venue's wiki data
		this.nytData = ko.observable("null");  //  This changes to show the currently selected venue's Times data
		this.infoWindow = ko.observable(new google.maps.InfoWindow({
	    					content: '<p id="header"></p>' + 
	    					'<p id="subheader">Wikipedia Snippet:</p>' +
	    					'<div id="wikipedia-info"></div>' + 
	    					'<p id="subheader">New York Times Snippet:</p>' +
	    					'<div id="nyt-info"></div>'
	  						}));
		var tracker = 0;
		var mapOptions = {
			center: new google.maps.LatLng(defaults.lat, defaults.lng),
			zoom: 13
		};
				
		var map = new google.maps.Map( defaults.$mapCanvas, mapOptions );
		

		//  Generates a map with the associated markers 
		this.initializeMap = function( results ) {
			setTimeout( function() { 
				if (typeof google === 'undefined') { 
					alert("Google Maps is taking too long to load, check internet connection");	
				} else {
					//alert("All is well!");  <--A primitive test that has passed
				}
			}, 10000); //  Times out if Google Maps takes too long to load 
			if (typeof google === 'undefined') {  
				alert("error loading Google Maps");  //  Fallback for if Google Maps API fails
			} else {
				if ( results ) {
					self.addMarkers(results, map);
				};
			}
		};
	
		//  Generates Google Map markers
		this.addMarkers = function( places, map ) {

			self.markers.removeAll(); 
			//var markerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			//var labelIndex = 0;
			
  			//  This function is courtesy of a Google Developers example for animation 
			var toggleBounce = function( marker ) {
 	 			if (marker.getAnimation() !== null) {
    				marker.setAnimation(null);
  				} else { 
  					marker.setAnimation(google.maps.Animation.BOUNCE);
  					setTimeout( function() { marker.setAnimation(null); }, 2000 );  //  Stops animation
				}
			};

			//  Binds the click of a marker to updating the info window's location
			var bindClick = function ( marker, item, info ) {
				marker.addListener('click', function() {
  						
  						console.log(info);
					  
					    toggleBounce( marker );
					    self.updateInfoWindow( marker, item, info);
					    //self.getWiki( item );  // this *works* now!!
					    
					});
			}

			//  Creates map markers based on associated user query
			tracker++;
			console.log("addMarkers has been called " + tracker + " times.");
			$.each( places, function ( index, item ) {
				var marker = new google.maps.Marker({
	    				position: {lat: item.lat, lng: item.lng},
	    				
	    				//label: markerLabels[labelIndex++ % markerLabels.length],
	    				animation: google.maps.Animation.DROP,
	    				map: map
	  				});
	  				console.log("Marker number " + index + " created . . . ");
	  				//  Store marker in 'marker' attribute
	  				item.marker = marker;
	  				//  Store info window in 'infoWindow' attribute
	  				item.infoWindow = self.infoWindow();
	  				console.log(item.marker, item.infoWindow );
	  				bindClick( marker, item, self.infoWindow() ) ;
  					self.markers.push(item.marker);
			})
  			//console.log(self.markers());
		};

		//  Updates the info window to ensure only one is open at a time and displays the correct info
		this.updateInfoWindow = function( marker, item, info ) {
			info.open(map, marker);
			self.getWiki( item );
			self.getNYTimes( item );
		}

		//  Compares query with 'results' observable and initializes a map w/out AJAX request
		this.filter = function() {
			self.infoWindow().close();
			//  Pushes place to 'results' array if the query is contained inside of the place's name
			$.each( self.results(), function( index, item ) {
				item.marker.visible = false;
				if (item.name.toLowerCase().search(self.place().toLowerCase()) !== -1) {
					item.marker.setVisible(true);
					console.log(item.marker);
				} else {
					item.marker.setVisible(false);
					console.log(item.marker);
				}
			});
			
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
			if (self.place() == "") { return false; } //  Catch the empty string
			$.getJSON("https://api.foursquare.com/v2/venues/search?client_id=DFMQLSBHUH2LQAQ3DQYSNSAR3TYCNHQJ3DEIHVKSMK0KBGPJ&client_secret=3J5U50Y3HOGLN3DJDHROLSZB4FBHEZCNW1P3VWHANK4KRNYO&v=20130815&ll=" + 
			defaults.lat + "," + defaults.lng + "&query=" + self.place(), function( data ) {
				var places = data.response.venues;  //  Pulls the array of search results from the JSON response 
				console.log( places );  //  Test . . . . 
				//  Populates 'results' array with venue information stored in 'Place' prototype 
				self.results.removeAll();  
				self.infoVisible.removeAll(); 
				//  TODO [!!] Check if undefined
				
			
				$.each( places, function( index, item ) {
					
						if (item.categories[0] == undefined) { 
							item.categories[0] = {
								pluralName: "Misc"
							};
						}
						
						console.log("Item categories returns " + item.categories[0].pluralName);
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
			var $header = $("#header");
			$.ajax( {
			    url: remoteUrlWithOrigin,
			    data: queryData,
			    dataType: 'jsonp',
			    type: 'POST',
			    headers: { 'Api-User-Agent': 'Joseph Anda -- orenmurasaki@gmail.com' },
			    //  'success' function alters the snippet and makes it the current wikiData item
			    success: function(data) {
			    	var firstResult = data.query.search[0];
			    	if(firstResult !== undefined) {
			    		if(firstResult.snippet == undefined) {
			    			firstResult.snippet = "No information found";
			    		}
			    		self.wikiData(firstResult.snippet);
			    	};
			    	$wikiDiv.html(self.wikiData());   
			    	$header.html(spot.name)    
				},
				error: function() { 
					alert('Could not fetch Wiki documents (potentially due to connectivity issues)'); 
				}
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

		//  Populates list upon initial rendering.  self.results() is bound to the list items via knockout
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
	    hood.addDefaultMarkers(myData);  //  Adds markers
    	hood.addDefaultList(myData);  //  Adds list
    })();
})();