Neighborhood Mapper V.1.1.0 by Joseph Anda

*New Notes to Grader*

Potential Issues/Questions:

-In respone to the last review, I added an auto-filter (this will filter the list as the user types).  For some reason, the textInput binding I made will only recognize all of the text up to the most recent character entry in the form field.  This is only a minor problem, but troubling.

-When I initially render my page, only the one of the map markers is visible initially, and I'm not sure why this is happening.  Any insights?

*(This issue below was recently fixed)*
~-I'm still struggling to build the Wikipedia-calling AJAX request into the click of the map marker.  I attempted to pair my self.getWiki() function with the event listener on the map marker (you'll find in my code that this is the case), but it does not demonstrate the desired behavior when clicked.  Right now, I can only get these to display when I click the associated item in the list view.~

-Can I make the label move with the animation (for example, if I pick a letter from the alphabet to label a marker, is there a way I can make it move as the marker is animated?)


*Notable Changes*

-  More compact List View
-  Animation ends automatically for clicked markers after a period of time.
-  Removed Marker labels

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