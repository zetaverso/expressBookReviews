const express = require("express");
const jwt = require("jsonwebtoken");
const regd_users = express.Router();
let books = require("./booksdb.js");

let users = [{ username: "carlos", password: "gonzalez" }];

const isValid = (username) => {
  const userMatches = users.filter((user) => user.username === username);
  return userMatches.length > 0;
};

const authenticatedUser = (username, password) => {
  const matchingUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return matchingUsers.length > 0;
};

regd_users.post("/login", (req, res) => {
  console.log("login: ", req.body);
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in right now" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("The user has successfully logged in");
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  console.log("add review: ", req.params, req.body, req.session);
  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = review;
    return res.status(200).send("Review successfully added");
  } else {
    return res.status(404).json({ message: `ISBN is not found` });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (books[isbn]) {
    let book = books[isbn];
    delete book.reviews[username];
    return res.status(200).send("Review successfully deleted");
  } else {
    return res.status(404).json({ message: `ISBN is not found` });
  }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
