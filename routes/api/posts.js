const express = require('express');
const router =  express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');


// @route GET api/posts/test
// @desc Tests post routes
// @access Public
router.get('/test', (req, res) => res.json({ msg: "posts res.json"}));


// @route GET api/posts
// @desc GET POSTS
// @access Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'No Posts Found' }));
});

// @route GET api/posts/:id
// @desc GET POST by ID
// @access Public
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound: 'No Post Found with this ID' }));
});


// @route DELETE api/posts/:id
// @desc Delete POST by ID
// @access Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //  Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ notauthorized: 'user not authorized' });
          }

          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post' }))
    })
});


// @route POST api/posts/like/:id
// @desc Like Post
// @access Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.ide).length > 0) {
            return res.status(400).json({ alreadyliked: 'User already liked this post' });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post' }))
    })
});

// @route POST api/posts/unlike/:id
// @desc Unlike Post
// @access Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if(post.likes.filter(like => like.user.toString() === req.user.ide).length === 0) {
            return res.status(400).json({ notliked: 'You have not liked this post' });
          }

          //Get remove index
          const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

          // Splice out of likes array
          post.likes.splice(removeIndex, 1);

          // save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post' }))
    })
});



// @route POST api/posts
// @desc Create Post
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check Validation
  if (!isValid) {
    // if errors, send error with 400
    return res.status(400).json(errors);
  }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});


// @route POST api/posts/comment/:id
// @desc Add a comment to a Post
// @access Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check Validation
  if (!isValid) {
    // if errors, send error with 400
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
    .then(post => {
      const newComment = {
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      }

      // Add to comment array
      post.comments.unshift(newComment);

      // save
      post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});


// @route DELETE api/posts/comment/:id/:comment_id
// @desc Remove a comment from a Post
// @access Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);

  // Check Validation
  if (!isValid) {
    // if errors, send error with 400
    return res.status(400).json(errors);
  }

  Post.findById(req.params.id)
    .then(post => {
      // Check if comment exists
      if (post.comment.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res.status(404).json({ commentnotexist: 'Comment does not exist' });
      }

      // Get remove index
      const removeIndex = post.comments.map(comment => comment._id.toString()).indexOf(req.params.comment_id);

      // Splice comment out of comment array
      post.comments.splice(removeIndex, 1);

      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

module.exports = router;
