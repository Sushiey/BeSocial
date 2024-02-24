const express = require('express');
const router = express.Router();
const Post = require('../models/post');

router.post('/posts', async (req, res) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content
    });
    await post.save();
    res.status(201).send(post); 
  } catch (err) {
    res.status(400).send(err); 
  }
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.send(posts); 
  } catch (err) {
    res.status(500).send(err); 
  }
});

router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ error: 'Post not found' });
    }
    res.send(post);
  } catch (err) {
    res.status(500).send(err); 
  }
});

router.put('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) {
      return res.status(404).send({ error: 'Post not found' });
    }
    res.send(post);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).send({ error: 'Post not found' });
    }
    res.send(post); 
  } catch (err) {
    res.status(500).send(err); 
  }
});

module.exports = router;
