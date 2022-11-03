const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//function that creates random string for the short url
const generateRandomString = () => {
  const possChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  while (randomString.length < 6) {
    randomString += possChar.charAt(Math.floor(Math.random() * possChar.length));
  }
  return randomString;
};
const findUser = (targetEmail) => {
  for (const user in users) {
    if (users[user].email === targetEmail) {
      return user;
    }
  }
  return null;
};

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//redirect the short url to the actual webpage
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Register
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password || findUser(req.body.email) !== null) {
    res.status(400).send('400 Bad Request');
  }
  const newID = generateRandomString();

  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password,
  };

  res.cookie('user_id', `${newID}`);
  res.redirect('/urls');
});

//login endpoint
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie('username', `${req.body.username}`);
  res.redirect('/urls');
});

//logout endpoint
app.get("/logout", (req, res) => {
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']], urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//generates new short url
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies['user_id']]};

  res.render("urls_new", templateVars);
});

//change existing url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);

});

//delete existing urls
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']], id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b></body></html>");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
