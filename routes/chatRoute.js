const express = require('express');

const route = express.Router();
const userAuthenticate = require('../middleware/auth');

const chatController = require('../controller/chatController');

route.get('/dashboard', chatController.getDashboard);

route.post('/message', userAuthenticate.authenticate, chatController.postMessage);
route.get('/getMessages', chatController.getMessage)

route.post('/create-group', chatController.createGroup);
route.get('/get-group', chatController.getGroups);

module.exports = route;