Neighborhood Mapper V.1.3.0 by Joseph Anda

QUESTIONS:



*New Notes to Grader and Notable changes*

-The last reviewer said "Your app is almost completely responsive. In the Google Nexus 5 view, the info window can be cut off at the top at times. An easy solution to this would be to set a max-height attribute to the info window and add an overflow-y:scroll."  In response, I added a div with max-height and overflow properties for the info window. 

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