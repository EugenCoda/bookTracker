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
- Added option to create languages and countries

Branch 6:

- Updated forms - get the data from db and pre-populate the existing information
- Updated forms - show the drop down list options in alphabetical order
- Implemented rating and review
- Check if email address is already in use (with express-validator)
- Implemented some password requirements (with express-validator)
- Validated and sanitized all user input
- Unescaped special characters when fetching text from db

Branch 7:

- Improve appearance - done (for now)
- Created display page for a book in my list

Branch 8:

- User email confirmation with token (and resending the token)
- Password reset with token and email confirmation
- Password change from user account page with email confirmation
- User account deletion (with booklist automatically deleted)
- User profile editing
- Contact page
- Images for books and authors

Branch 9:

- Search bar - pretty basic, but it works sufficiently fine for the moment.
- Fixed adding multiple genres

TODO:

- add multiple authors option
- sorting and filtering lists
- deploy app to heroku
- social networks

Problematic:

- date_added should be recorded automatically (for updates it should remain unchanged)
- date_updated should be recorded automatically (for new items it should be equal to date_added)
- restrict adding a book more than once in a booklist - done in branch 5(still with a 500 error)
- truncate book summaries - partially (not able to expand text)
