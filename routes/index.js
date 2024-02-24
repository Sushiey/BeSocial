const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
  secret: 'your_secret_key_here',
  resave: false,
  saveUninitialized: true
}));

const dbPath = path.join(__dirname, '..', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.static(path.join(__dirname, '..', 'views')));

app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'signup.html'));
});

app.get('/email-exists', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'email_exists.html'));
});

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) {
      console.error('Error querying database:', err.message);
      return res.status(500).send('Internal Server Error');
    }
    if (existingUser) {
      return res.status(409).sendFile(path.join(__dirname, '..', 'views', 'email_exists.html'));
    }
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err) => {
      if (err) {
        console.error('Error inserting user into database:', err.message);
        return res.status(500).send('Internal Server Error');
      }
      res.redirect('/login');
    });
  });
});

app.get('/invalid-login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'invalid_login.html'));
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
    if (err) {
      console.error('Error querying database:', err.message);
      return res.status(500).send('Internal Server Error');
    }
    if (!user) {
      return res.redirect('/invalid-login');
    }
    req.session.userId = user.id;
    res.redirect('/profile');
  });
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'profile.html'));
});

app.get('/user', (req, res) => {
  const userId = req.session.userId;
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Error querying database:', err.message);
      return res.status(500).send('Internal Server Error');
    }
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user);
  });
});

app.get('/user-posts-data', (req, res) => {
  const userId = req.session.userId; 
  const postsFilePath = path.join(__dirname, '..', 'posts.json');
  if (fs.existsSync(postsFilePath)) {
    const data = fs.readFileSync(postsFilePath);
    let posts = JSON.parse(data);

    posts = posts.filter(post => post.userId === userId);

    res.json(posts);
  } else {
    res.json([]);
  }
});

app.post('/posts', (req, res) => {
  const userId = req.session.userId;
  const { content } = req.body;
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }
  const postsFilePath = path.join(__dirname, '..', 'posts.json');
  let posts = [];
  if (fs.existsSync(postsFilePath)) {
    const data = fs.readFileSync(postsFilePath);
    posts = JSON.parse(data);
  }
  const newPost = {
    userId: userId,
    content: content,
    createdAt: new Date().toISOString()
  };
  posts.push(newPost);
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
  res.status(201).send('Post created successfully');
});

app.get('/all-posts', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'all_posts.html'));
});

app.get('/all-posts-data', (req, res) => {
  const postsFilePath = path.join(__dirname, '..', 'posts.json');
  if (fs.existsSync(postsFilePath)) {
    const data = fs.readFileSync(postsFilePath);
    const posts = JSON.parse(data);
    const postsWithUsername = [];

    posts.forEach(post => {
      db.get('SELECT * FROM users WHERE id = ?', [post.userId], (err, user) => {
        if (err) {
          console.error('Error querying database:', err.message);
          return res.status(500).send('Internal Server Error');
        }
        if (user) {
          postsWithUsername.push({
            username: user.username,
            content: post.content,
            createdAt: post.createdAt
          });
        } else {
          console.error('User not found for post with userId:', post.userId);
        }

        if (postsWithUsername.length === posts.length) {
          res.json(postsWithUsername);
        }
      });
    });
  } else {
    res.json([]);
  }
});



app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err.message);
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
