const express = require('express');
const router =  express.Router();

// @route GET api/profile/test
// @desc Tests profile routes
// @access Public
router.get('/test', (req, res) => res.json({ msg: "profile res.json"}));

module.exports = router;
