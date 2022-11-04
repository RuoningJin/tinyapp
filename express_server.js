const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const {findUser} = require('./helpers.js');
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
};

//functions
const generateRandomString = () => {
  const possChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  while (randomString.length < 6) {
    randomString += possChar.charAt(Math.floor(Math.random() * possChar.length));
  }
  return randomString;
};

const urlsForUser = (id) => {
  const userData = {};
  for (const data in urlDatabase) {
    if (urlDatabase[data].userID === id) {
      userData[data] = urlDatabase[data];
    }
  }
  return userData;
};

//middlewares

app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],
  maxAge: 24 * 60 * 60 * 1000
}));

//redirect the short url to the actual webpage
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    res.status(404).send('404 Page Not Found');
  }
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Register
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('400 Bad Request');
  }
  if (findUser(req.body.email, users) !== undefined) {
    return res.send('User email already exist.');
  }
  const newID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword,
  };

  req.session.user_id = newID;
  res.redirect('/urls');
});

//login endpoint
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = findUser(req.body.email, users);

  if (user === undefined || !bcrypt.compareSync(req.body.password, user.password)) {
    res.status(403).send('403 Forbidden');
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

//logout endpoint
app.get("/logout", (req, res) => {
  res.redirect('/login');
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("Please login to enable the features.");
  }
  const userData = urlsForUser(req.session.user_id);
  const templateVars = {user: users[req.session.user_id], urls: userData};
  res.render("urls_index", templateVars);
});

//generates new short url
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("Please login to enable this feature.");
  }
  console.log(req.body); // Log the POST request body to the console
  const newID = generateRandomString();
  urlDatabase[newID] = {longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect(`/urls/${newID}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

//change existing url

app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("Bad Request");
  }
  if (!req.session.user_id) {
    res.send("Please login to enable this feature.");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send('403 Forbidden');
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect(`/urls`);
});

//delete existing urls
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("Bad Request");
  }
  if (!req.session.user_id) {
    res.send("Please login to enable this feature.");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send('403 Forbidden');
  }
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});


app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.send("Please login to enable this feature.");
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).send('403 Forbidden');
  }
  const templateVars = { user: users[req.session.user_id], id: req.params.id, longURL: urlDatabase[req.params.id].longURL };
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
