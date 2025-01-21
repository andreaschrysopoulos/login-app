const express = require('express');
const session = require('express-session');
const expressLayout = require('express-ejs-layouts');

const { Pool } = require('pg');
require('dotenv').config();

const path = require('path');
const app = express();
const PORT = 3120;

app.use(express.static('src'));
app.use(express.json());
app.use(expressLayout);

app.set('view engine', 'ejs');
app.set('views', './views');
app.set('layout', 'layouts/layout.ejs');

// PostgreSQL connection setup
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Helper functions
const registerUser = async (email, passwordHash) => {
  await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
    [email, passwordHash]
  );
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

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
    res.render('SignedInPage', { title: "Clandestine Operations" });
  } else {
    res.render('SignInPage', { title: "Sign in | Clandestine Operations" });
  }
});

app.get('/register', (req, res) => {
  if (!req.session.user) {
    res.render('CreateAccountPage', { title: "Create New Account | Clandestine Operations" });
  } else {
    res.send('Already Signed In');
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
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const bcrypt = require('bcrypt');

  try {
    const user = await findUserByEmail(email);
    if (user && await bcrypt.compare(password, user.password_Hash)) {
      req.session.user = { email }; // Store user info in session
      console.log("Successful Auth");
      res.send('OK');

    } else {
      console.log("Unsuccessful Auth");
      res.send('error');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in.');
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