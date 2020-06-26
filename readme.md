MDN Server Side Programming
https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs

Master: Implemented the local library from MDN with minor changes

Branch 1: Removed code related to book instances

Branch 2: Implemented user register, login and logout

Branch 3: Created userController and rearranged the code from users.js

Branch 4:

- Created schema for booklists for individual user (when register user)
- Implemented the add books to my book list feature
- Created a display menu for my book list

Branch 5:

- Formatted date in booklist
- Restricted adding a book more than once in a booklist(still with a 500 error)
- Restricted deleting a book if used in a booklist
- Book details - changed from "Add to my list" to Status/Edit/Remove when already added
- Added country to authors
- Added language, original language, original title and number of pages to books
- Added current page to personal list
- Moved ensureAuthenticated, ensureGuest to a separate file (middleware folder)
- Implement session for user login (it does not kick the user out if there are changes in the files)
- Moved config.env to config folder
- Created db.js file in config folder and moved database connection code there

TODO:

- add option to create languages and countries
- update forms - get the data from db and pre-populate the existing information
- update forms - show the drop down list options in alphabetical order
- show book, authors, genres count in "All..." links
- check if email address is already in use (with express-validator)
- implement some password requirements (with express-validator)
- enable user profile editing & password change / reset (with email confirmation?)
- delete user booklist automatically if an user account is deleted
- validate and sanitize all user input (done partially)
- search bar

Problematic:

- date_added should be recorded automatically (for updates it should remain unchanged)
- date_updated should be recorded automatically (for new items it should be equal to date_added)
- enable special characters when fetching text from db
- restrict adding a book more than once in a booklist - done in branch 5(still with a 500 error)
