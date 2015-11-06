
/*  TODO:
[!!]  Take steps to earn Nanodegree
[!!]  Update the resume
[  ]  Update the portfolio
[  ]  Update frogger
[  ]  Update neighborhood mapper:  
	[  ]  Consider making filter-as-you-type functionality?  
	[  ]  Add more locations
	[  ]  Make the menu a little prettier
	[  ]  Note the last reviewers suggestions 
*/
//  The function below is the callback for the google maps API script tag in index.html
var googleSuccess = function() {
	"use strict";
	
	//  Store commonly used constants in this object
	var defaults = {

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
			this.visible = true;
		},
	};	

	//  Holds ViewModel functionality
	function NeighborhoodViewModel() {
		var self = this;  //  Allows 'this' to be used within nested scopes
		self.place = ko.observable("");  //  User query in the search bar 
		self.results = ko.observableArray();  //  Stores the 'place' objects
		self.markers = ko.observableArray();  //  Stores markers
		self.categories = ko.observableArray(["Coffee Shops", "Salons / Barber Shops", "Pizza Places", "Food Courts", "Chinese Restaurants"]); 
		self.tests = ko.observableArray();  //  Never used, but may be accessed in later versions 
		self.infoVisible = ko.observableArray();  //  Determines whether or not the list view shows extra AJAX info
		self.visibleEntries = ko.observableArray();  //  Controls the state of the list view
		self.wikiData = ko.observable("Click a location in the list for more information!");  //  This changes to display the currently selected venue's wiki data
		self.nytData = ko.observable("null");  //  This changes to show the currently selected venue's Times data
		var infoWindow = new google.maps.InfoWindow({
	    					content: '<div id="infowindow">' + '<p id="header"></p>' + 
	    					'<p id="formattedAddress"></p>' +
	    					'<p id="venueType"></p>' +
	    					'<p id="subheader">Wikipedia Snippet:</p>' +
	    					'<div id="wikipedia-info"></div>' + 
	    					'<p id="subheader">New York Times Snippet:</p>' +
	    					'<div id="nyt-info"></div>' + '</div>'
	  						});
		var tracker = 0;
		var counter = 0;
		var mapOptions = {
			center: new google.maps.LatLng(defaults.lat, defaults.lng),
			zoom: 13
		};
				
		var map = new google.maps.Map( document.getElementById('map-canvas'), mapOptions );

		//  Generates a map with the associated markers 
		this.initializeMap = function( results ) {
			setTimeout( function() { 
				if (typeof google === 'undefined') { 
					alert("Google Maps is taking too long to load, check internet connection");	
				} 
			}, 10000); //  Times out if Google Maps takes too long to load 
			if (typeof google === 'undefined') {  
				alert("error loading Google Maps");  //  Fallback for if Google Maps API fails despite working connection
			} else {
				if ( results ) {
					self.addMarkers(results, map);
				}
			}
		};
	
		//  Generates Google Map markers
		this.addMarkers = function( places, map ) {

			self.markers.removeAll(); 
			
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
					    toggleBounce( marker );
					    self.updateInfoWindow( marker, item, info);
					});
			};

			//  Creates map markers based on associated user query
			tracker++;
			console.log("addMarkers has been called " + tracker + " times.");
			$.each( places, function ( index, item ) {
				var marker = new google.maps.Marker({
	    				position: {lat: item.lat, lng: item.lng},
	    				animation: google.maps.Animation.DROP,
	    				map: map
	  				});
	  				console.log("Marker number " + index + " created . . . ");
	  				//  Store marker in 'marker' attribute
	  				item.marker = marker;
	  				//  Store info window in 'infoWindow' attribute
	  				item.infoWindow = infoWindow;
	  				console.log(item.marker, item.infoWindow );
	  				bindClick( marker, item, infoWindow ) ;
  					self.markers.push(item.marker);
			});
		};

		//  Updates the info window to ensure only one is open at a time and displays the correct info
		this.updateInfoWindow = function( marker, item ) {
			self.getWiki( item );
			self.getNYTimes( item );
			self.getFourSquare( item );
		
			if (++counter > self.results().length) { 
				infoWindow.open(map, marker);
			}
		};

		//  Compares query with 'results' observable and initializes a map w/out AJAX request
		this.filter = function() {
			infoWindow.close();
			//  Pushes place to 'results' array if the query is contained inside of the place's name
			$.each( self.results(), function( index, item ) {
				item.marker.visible = false;
				if (item.name.toLowerCase().search(self.place().toLowerCase()) !== -1) {
					item.marker.setVisible(true);
					//  Returns entry to the list view if it matches the query but is not displayed int he list
					if (self.visibleEntries.indexOf(item.name) == -1) { 
						self.visibleEntries.push(item.name);
					}
					console.log(item.marker);
				} else {
					item.marker.setVisible(false);
					self.visibleEntries.remove(item.name);
					console.log("visibleEntries looks like this: " + self.visibleEntries());
					console.log("The item name is " + item.name);
					console.log(item.marker);
				}
			});
			self.getMarkers();  //  < -- This is is just to force FourSquare to populate the console window
			//  with info that I can use to update this app.
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
				if ((item !== null) && (item.name.toLowerCase().search(data.place().toLowerCase()) !== -1)) {
					console.log('query contained in list');  //  Testing . . . 
				} else {
					self.results.remove( item );
				}
			});
			return true;
		};

		//  AJAX request to Foursquare bound to user clicking 'Get Markers' button.  Also initializes map markers
		this.getMarkers = function() { 
			if (self.place() === "") { return false; } //  Catch the empty string
			$.getJSON("https://api.foursquare.com/v2/venues/search?client_id=DFMQLSBHUH2LQAQ3DQYSNSAR3TYCNHQJ3DEIHVKSMK0KBGPJ&client_secret=3J5U50Y3HOGLN3DJDHROLSZB4FBHEZCNW1P3VWHANK4KRNYO&v=20130815&ll=" + 
			defaults.lat + "," + defaults.lng + "&query=" + self.place(), function( data ) {
				var places = data.response.venues;  //  Pulls the array of search results from the JSON response 
				console.log( places );  //  Test . . . . 
				//  Populates 'results' array with venue information stored in 'Place' prototype 
				self.results.removeAll();  
				self.infoVisible.removeAll(); 
				
				$.each( places, function( index, item ) {
					
						if (item.categories[0] === undefined) { 
							item.categories[0] = {
								pluralName: "Misc"
							};
						}
						var place = new defaults.Place(item.name, item.location.lat, item.location.lng, item.contact.phone, item.url, item.categories[0].pluralName);
						self.results.push(place);
				});
			self.initializeMap(self.results());
			})
			.error(function() { alert("error"); });  //  Experimental error handler
			return false;   //  To prevent the default action of the page refreshing 
		};

		this.getFourSquare = function( spot ) { 
			if ( spot.name === "" || spot.name === null) { return false; } //  Catch the empty string
			$.getJSON("https://api.foursquare.com/v2/venues/search?client_id=DFMQLSBHUH2LQAQ3DQYSNSAR3TYCNHQJ3DEIHVKSMK0KBGPJ&client_secret=3J5U50Y3HOGLN3DJDHROLSZB4FBHEZCNW1P3VWHANK4KRNYO&v=20130815&ll=" + 
			defaults.lat + "," + defaults.lng + "&query=" + spot.name, function( data ) {
				var places = data.response.venues;  //  Pulls the array of search results from the JSON response 
				console.log(data.response);
				//  Populates 'results' array with venue information stored in 'Place' prototype 
				var $locationDiv = $("#formattedAddress");
				var $venueTypeDiv = $("#venueType");
				$locationDiv.html(data.response.venues[0].location.formattedAddress[0]);
				$venueTypeDiv.html(data.response.venues[0].categories[0].name);
				$.each( places, function( index, item ) {
						if (item.categories[0] === undefined) { 
							item.categories[0] = {
								pluralName: "Misc"
							};
						}
				});
			})
			.error(function() { alert("error"); });  //  Experimental error handler
			return false;   //  To prevent the default action of the page refreshing 
		};

		//  AJAX request to New York Times website 
		this.getNYTimes = function ( spot ) {
			var key = "&api-key=6b539ed4808bc69e6e974a036e2de9f2:1:72423609";
	    	var nytimesApiUrl = "http://api.nytimes.com/svc/search/v2/articlesearch.json?q=" + spot.name + '&fq=news_desk:("Market Place" "Business" "Retail" "Small Business")' + key;
	    	$.getJSON( nytimesApiUrl  , function( data ) {
	    		var articles = data.response.docs;
	    		var tags = [];
	    		var $nytDiv = $("#nyt-info");
	    
	    		$.each( articles, function( index, article) {
	    			if (article.lead_paragraph === null) { 
	    				article.lead_paragraph = "(No articles found)"; 
	    			}
	    			
	    			var elem = "<li class='article'>" + "<a href=" + article.web_url+">" + article.headline.main + 
                	"</a>" + "<p>" + article.lead_paragraph +"</p>" + "</li>";
	    			tags.push( elem );
	    			spot.nyt = elem;
            	});

            	self.nytData(tags[0]);
            	$nytDiv.html(self.nytData());
	    	}).error(function(){
	        	console.log('New York Times Articles Could Not Be Loaded');
	        });
	    };
		
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
			
			$.ajax( {
			    url: remoteUrlWithOrigin,
			    data: queryData,
			    dataType: 'jsonp',
			    type: 'POST',
			    headers: { 'Api-User-Agent': 'Joseph Anda -- orenmurasaki@gmail.com' },
			    //  'success' function alters the snippet and makes it the current wikiData item
			    success: function(data) {
			    	var firstResult = data.query.search[0];
			    	var $wikiDiv = $("#wikipedia-info");
					var $header = $("#header");
			    	if(firstResult !== undefined) {
			    		if(firstResult.snippet === undefined) {
			    			firstResult.snippet = "No information found";
			    		}
			    		self.wikiData(firstResult.snippet);
			    	}
			    	$wikiDiv.html(self.wikiData());   
			    	$header.html(spot.name);    
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
		};

		//  Populates list upon initial rendering.  self.results() is bound to the list items via knockout
		this.addDefaultList = function ( defaults ) {
				$.each( defaults, function( index, item ) {
					self.visibleEntries.push( item.name );
					self.results.push( item );  
					console.log("The number " + index + " entry in the visibleEntries array is " + self.visibleEntries()[index]);
				});
			};
    }

    //  Initialize JSON locations, ViewModel bindings, markers, and list view
    var render = (function() {
    	var hood = new NeighborhoodViewModel();
    	var	myData = JSON.parse(defaultPlaces);
    	ko.applyBindings( hood ); 
	    hood.addDefaultMarkers(myData);  //  Adds markers
    	hood.addDefaultList(myData);  //  Adds list 	
    })();
};

//  If for some reason googleSuccess() is unsuccessful
var googleError = function() { alert("It seems Google Maps has failed to load (Try checking internet connection and/or script url)"); };