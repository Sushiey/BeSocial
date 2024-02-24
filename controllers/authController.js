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
  try {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    res.send(user); 
  } catch (err) {
    res.status(401).send({ error: err.message });
  }
});

module.exports = router;
