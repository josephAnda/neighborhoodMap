Neighborhood Mapper V.1.0.0 by Joseph Anda

NOTE TO GRADER:  

Hello!  This version is far from complete, and the bulk of the problems lie in the physical layout of the User Interface and synchronization of AJAX requests (with each other, specifically NYTimes and Wikipedia).  In this submission, I hope to find feedback that suggest ways to streamline my UI, sync up my non-Foursquare AJAX requests, and perhaps even make the code more compact.  

USING THE MAPPER:

1)  Search a type of venue by entering it into the search bar (e.g., 'coffee shops') and clicking the 'search' button.
2)  View ,filter, and explore results in the list by checking and unchecking category boxes, or clicking on names in the list
3)  Clcick the names to pull up Wiki info (if available), and click on the Wiki info to get more info (additional info from new york times)
4)  Search new venues by entering another query into the search bar.  Only entries matching checked categories will populate


ABOUT NEIGHBORHOOD MAPPER

This project is intended to showcase a few major front-end development-related skills:

1)  Using organizational libraries (in this case, knockout and jQuery)
2)  Applying the MVVM paradigm for separation of concerns
3)  Utilizing AJAX reqeusts to relay third-party info to the user