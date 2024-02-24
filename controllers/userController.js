const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/register', async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    await user.save();
    res.status(201).send(user); 
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/login', async (req, res) => {
});

router.post('/logout', async (req, res) => {
});

router.get('/profile/:userId', async (req, res) => {
});

router.put('/profile/:userId', async (req, res) => {
});

router.delete('/profile/:userId', async (req, res) => {
});

module.exports = router;
