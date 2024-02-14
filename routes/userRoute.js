const express = require('express');
const path = require('path');

const route = express.Router();
const userController = require('../controller/userController');

route.post('/signup', userController.postSignUp);
route.get('/signup', userController.getSignUp);

module.exports = route;