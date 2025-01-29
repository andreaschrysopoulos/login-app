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
app.set('layout', 'layouts/Layout.ejs');

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

const editEmail = async (oldEmail, newEmail) => {
  await pool.query(
    'UPDATE users SET email = $1 WHERE email = $2',
    [newEmail, oldEmail]
  );
}

const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const deleteUser = async (email) => {
  await pool.query(
    'DELETE FROM users WHERE email = $1',
    [email]
  );
};

// Session init
app.set('trust proxy', 1);
app.use(session({
  secret: 'your_secret_key', // Replace with a secure secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } // Set to true if using HTTPS
}));


// HOME Route
app.get('/', (req, res) => {
  if (req.session.user) {
    res.render('HomePage', { title: "Home | Clandestine Operations", layout: 'layouts/SignedInLayout.ejs' });
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

app.get('/settings', (req, res) => {
  if (req.session.user) {
    res.render('SettingsPage', { title: "Settings | Clandestine Operations", layout: 'layouts/SignedInLayout.ejs' });
  } else {
    res.redirect('/');
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

    if (user && await bcrypt.compare(password, user.password_hash)) {
      req.session.user = { email }; // Store user info in session
      res.send('OK');

    } else {
      res.send('credentials');
    }
  } catch (error) {
    console.error(error);
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

// POST: CREATE NEW ACCOUNT
app.post('/createAccount', async (req, res) => {
  const { email, password, rpassword } = req.body;
  const bcrypt = require('bcrypt');

  const user = await findUserByEmail(email);
  if (user) {
    res.send('exists');
  }
  else {
    if (password !== rpassword) {
      res.send('nomatch');
    } else {
      await registerUser(email, await bcrypt.hash(password, 10));
      res.send('ok');
    }
  }
});


app.post('/deleteAccount', async (req, res) => {
  const user = req.session.user;
  if (user) {
    deleteUser(user.email);
    req.session.destroy(err => {
      if (err) {
        console.log(err);
        res.status(500).send('Could not log out.');
      } else {
        res.redirect('/');
      }
    });
  } else {
    console.log('error');
  }
});

app.post('/editEmail', async (req, res) => {
  const { email } = req.body;

  const user = req.session.user;
  try {
    if (user) {
      if (email) {
        await editEmail(user.email, email);
        req.session.user.email = email;
        req.session.save();
        res.send('ok');
      }
    }
  } catch (error) {
    res.send(error);
  }

});

app.post('/editPass', async (req, res) => {
  const { email } = req.body;

  const user = req.session.user;
  try {
    if (user) {
      if (email) {
        await editEmail(user.email, email);
        req.session.user.email = email;
        req.session.save();
        res.send('ok');
      }
    }
  } catch (error) {
    res.send(error);
  }

});


// Start Server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});