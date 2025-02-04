const express = require('express');
const session = require('express-session');
const expressLayout = require('express-ejs-layouts');
const fileUpload = require('express-fileupload');
const fs = require('fs');


const { Pool } = require('pg');
require('dotenv').config();
const path = require('path');
const app = express();
const PORT = 3120;
const userDataLocation = __dirname + '/userData/';

app.use(express.static('src'));
app.use(fileUpload());
app.use(express.json());
app.use(expressLayout);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', path.join(__dirname, 'views/layouts/Layout.ejs'));

const debugTime = 1;

// PostgreSQL connection setup
const sql = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Helper functions
const registerUser = async (email, passwordHash) => {
  await sql.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
    [email, passwordHash]
  );
};

const editEmail = async (oldEmail, newEmail) => {
  await sql.query(
    'UPDATE users SET email = $1 WHERE email = $2',
    [newEmail, oldEmail]
  );
}

const editPassword = async (user, passwordHash) => {
  await sql.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2',
    [passwordHash, user]
  );
}

const findUserByEmail = async (email) => {
  const result = await sql.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};


const deleteUser = async (email) => {
  await sql.query(
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
    await deleteUser(user.email);
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
  const { newPassword, confirmNewPassword } = req.body;
  const user = req.session.user;
  const bcrypt = require('bcrypt');

  try {
    if (user) {
      if (newPassword !== confirmNewPassword) {
        res.send('nomatch');
      } else {
        await editPassword(user.email, await bcrypt.hash(newPassword, 10));
        res.send('ok');
      }
    } else {
      res.send("unauthorized");
    }
  } catch (error) {
    res.send(error);
  }

});


const getPhoto = async (email) => {

  const sqlResult = await sql.query(
    'SELECT profile_photo_url FROM users WHERE email = $1',
    [email]
  );

  let imagePath = sqlResult.rows[0].profile_photo_url;

  if (!imagePath)
    imagePath = __dirname + '/serverData/generic.jpg';

  return imagePath;
};


const savePhoto = async (email, image) => {

  // Check directory exists and if not, create it.
  try {
    if (!fs.existsSync(userDataLocation + email))
      fs.mkdirSync(userDataLocation + email, { recursive: true });

  } catch {
    return 'error';
  }

  // Set image location.
  imageLocation = userDataLocation + email + '/photo';

  // 1. Save file on server.
  const saveFunc = image.mv(imageLocation, (err) => {
    if (err) {
      console.error(`Error saving photo: ${err}`)
      return 'error';
    }
  });

  if (saveFunc === 'error')
    return 'error';

  // 2. Save imageURL to Database.
  try {
    await sql.query(
      'UPDATE users SET profile_photo_url = $1 WHERE email = $2',
      [imageLocation, email]
    );
    return 'ok';
  } catch {
    return 'error';
  }

};

///////// Photo ROUTES /////////

app.post('/updatePhoto', async (req, res) => {

  // Check if user is signed in.
  const user = req.session.user;
  if (user) {

    if (!req.files || Object.keys(req.files).length === 0)
      return res.status(400).send('No files were uploaded.')

    const status = await savePhoto(user.email, req.files.image);

    if (status === 'ok')
      res.redirect('/settings');
    else
      res.send(status);
  } else {
    res.send('Unauthorized access.');
  }
});


const deletePhoto = async (email) => {

  // 1. Try to delete file from server.
  try {
    fs.unlinkSync(userDataLocation + email + '/photo');
  } catch {
    return 'Error deleting file from server.';
  }

  // 2. Try to delete URL from Database.
  try {
    await sql.query(
      'UPDATE users SET profile_photo_url = $1 WHERE email = $2',
      [null, email]
    );
  } catch {
    return 'Error setting the photo URL in the Database to null';
  }

  return 'ok';
};

app.post('/removeProfilePhoto', async (req, res) => {

  // Check if user is signed in.
  const user = req.session.user;
  if (user) {

    const status = await deletePhoto(user.email);

    if (status === 'ok')
      res.redirect('/settings');
    else
      res.send(status);

  } else
    res.send('Unauthorised.');

});


app.get('/profilePhoto', async (req, res) => {
  // Check if user is signed in.
  const user = req.session.user;
  if (user)
    res.sendFile(await getPhoto(user.email));
  else
    res.redirect('/');
});

////// START SERVER //////
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}.`);
});
