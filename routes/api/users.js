const express = require('express');
const router =  express.Router();

// @route GET api/users/test
// @desc Tests users routes
// @access Public
router.get('/test', (req, res) => res.json({ msg: "users res.json"}));

module.exports = router;
