Neighborhood Mapper V.1.1.0 by Joseph Anda

*New Notes to Grader and Notable changes*

--Fixed the viewport responsivity issue by adding the navbar class to DOM elements
--Paired list clicking with info window updating and opening
--Fixed info-window bugs (such as AJAX info from wrong venue populating window)
--Wrote fallback method for googel Map
--Hide markers with 'filter' function via setVisible() method
--Fixed errors returned when user makes empty or nonsensical query
--Simplified the search functions
--Integrated Foursquare (via getMarkers method)
--Used setTimeout() to ensure error handler works properly in event of no internet connection (waits 10 seconds)

*Potential Issues*

--The Last grader lamented that my maps were not loading asynchronously, which may still be a problem (but I have since
refactored).  I hope that I am closer to a 'Meets Specifications' nonetheless!  

*Using the Mapper*

0)  Open the file titled 'index.html' in your web browser.  
1)  Search a type of venue by entering it into the search bar (e.g., 'coffee shops') and clicking the 'search' button.
2)  View ,filter, and explore results in the list by checking and unchecking category boxes, or clicking on names in the list
3)  Clcick the names to pull up Wiki info (if available), and click on the Wiki info to get more info (additional info from new york times)
4)  Search new venues by entering another query into the search bar.  Only entries matching checked categories will populate


*About Neighborhood Mapper*

This project is intended to showcase a few major front-end development-related skills:

1)  Using organizational libraries (in this case, knockout and jQuery)
2)  Applying the MVVM paradigm for separation of concerns
3)  Utilizing AJAX reqeusts to relay third-party info to the user