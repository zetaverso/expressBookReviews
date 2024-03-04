const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
const public_users = express.Router();
let users = require("./auth_users.js").users;

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered.." });
    } else {
      return res.status(404).json({ message: "Oh no, user already exists" });
    }
  }
});

public_users.get("/", function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

public_users.get("/isbn/:isbn", function (req, res) {
  const ISBN = req.params.isbn;

  res.send(books[ISBN]);
});

public_users.get("/author/:author", function (req, res) {
  let answer = [];
  for (const [key, values] of Object.entries(books)) {
    const book = Object.entries(values);
    for (let i = 0; i < book.length; i++) {
      if (book[i][0] == "author" && book[i][1] == req.params.author) {
        answer.push(books[key]);
      }
    }
  }
  if (answer.length == 0) {
    return res.status(300).json({ message: "Author not found" });
  }
  res.send(answer);
});

public_users.get("/title/:title", function (req, res) {
  let answer = [];
  for (const [key, values] of Object.entries(books)) {
    const book = Object.entries(values);
    for (let i = 0; i < book.length; i++) {
      if (book[i][0] == "title" && book[i][1] == req.params.title) {
        answer.push(books[key]);
      }
    }
  }
  if (answer.length == 0) {
    return res.status(300).json({ message: "Title not found" });
  }
  res.send(answer);
});

public_users.get("/review/:isbn", function (req, res) {
  const ISBN = req.params.isbn;
  res.send(books[ISBN].reviews);
});

function getBookList() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

public_users.get("/", function (req, res) {
  getBookList().then(
    (bk) => res.send(JSON.stringify(bk, null, 4)),
    (error) => res.send("denied")
  );
});

function getFromISBN(isbn) {
  let book_ = books[isbn];
  return new Promise((resolve, reject) => {
    if (book_) {
      resolve(book_);
    } else {
      reject("Unable to find this book");
    }
  });
}

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  getFromISBN(isbn).then(
    (bk) => res.send(JSON.stringify(bk, null, 4)),
    (error) => res.send(error)
  );
});

function getFromAuthor(author) {
  let output = [];
  return new Promise((resolve, reject) => {
    for (var isbn in books) {
      let book_ = books[isbn];
      if (book_.author === author) {
        output.push(book_);
      }
    }
    resolve(output);
  });
}

public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  getFromAuthor(author).then((result) =>
    res.send(JSON.stringify(result, null, 4))
  );
});

function getFromTitle(title) {
  let output = [];
  return new Promise((resolve, reject) => {
    for (var isbn in books) {
      let book_ = books[isbn];
      if (book_.title === title) {
        output.push(book_);
      }
    }
    resolve(output);
  });
}

public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  getFromTitle(title).then((result) =>
    res.send(JSON.stringify(result, null, 4))
  );
});

module.exports.general = public_users;
