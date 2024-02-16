const express = require('express');

const route = express.Router();

const chatController = require('../controller/chatController');

route.get('/dashboard', chatController.getDashboard);


module.exports = route;