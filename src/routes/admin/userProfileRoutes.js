const express = require('express');
const router = express.Router();
const { renderUserProfile } = require('../../controllers/admin/UserProfileController');

router.get('/profile', renderUserProfile);

module.exports = router;
