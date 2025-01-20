const express = require('express');
const session = require('express-session');
const expressLayout = require('express-ejs-layouts');

const path = require('path');
const app = express();
const PORT = 80;

app.use(express.static('src'));
app.use(express.json());
app.use(expressLayout);

app.set('view engine', 'ejs');
app.set('views', './views');
app.set('layout', 'layouts/layout.ejs'); 

const credentials = {
  email: 'andreaschrysopoulos@gmail.com',
  password: 'password'
}

// Session init
app.use(session({
  secret: 'your_secret_key', // Replace with a secure secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));


// HOME Route
app.get('/', (req, res) => {
  if (req.session.user) {
    res.render('HomePage');
  } else {
    res.render('LoginPage');
  }
});

// GET /data for HomePage
app.get('/data', (req, res) => {
  if (req.session.user) {
    res.send(req.session.user.email);
  } else {
    res.send("error");
  }
});


// POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email === credentials.email && password === credentials.password) {
    req.session.user = { email }; // Store user info in session
    console.log("Successful Auth");
    res.send('OK');
  } else {
    console.log("Unsuccessful Auth");
    res.send('error');
  }
});

// POST /logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      res.status(500).send('Could not log out.');
    } else {
      res.redirect('/');
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});