MDN Server Side Programming
https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs

Master: Implemented the local library from MDN with minor changes

Branch 1: Removed code related to book instances

Branch 2: Implemented user register, login and logout

Branch 3: Created userController and rearranged the code from users.js

Branch 4: Created schema for booklists for individual user (when register user)
Implemented the add books to my book list feature
Created a display menu for my book list

TODO:

- format date in booklist
- restrict deleting a book if used in a booklist
- restrict adding a book more than once in a booklist
- update forms - get the data from db and pre-populate the existing information
- show book, authors, genres count in "All..." links
- book details - change from "Add to my list" to Status/Edit/Remove when already added
- enable special characters when fetching text from db
- search bar
