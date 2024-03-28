const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const controlEmail = require('../middleware/controlEmail'); 


router.post('/signup', controlEmail, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;