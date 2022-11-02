const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = {username: req.cookies["username"]};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  res.cookie('username', `${req.body.username}`);
});

//login endpoint
app.get("/login", (req, res) => {
  res.redirect('/urls');
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
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const templateVars = {username: req.cookies["username"], urls: urlDatabase};
  console.log(req.cookies);
  res.render("urls_index", templateVars);
});

//generates new short url
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  console.log(req.body.longURL);
  res.redirect(`/urls/${newID}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};

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
  const templateVars = { username: req.cookies["username"], id: req.params.id, longURL: urlDatabase[req.params.id] };
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
