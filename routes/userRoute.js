const express = require('express');


const route = express.Router();
const userController = require('../controller/userController');

route.post('/login', userController.postLogin);
route.get('/login', userController.getLogin);

route.post('/signup', userController.postSignUp);
route.get('/signup', userController.getSignUp);

route.post('/logout', userController.postLogout);
route.get('/activeUsers', userController.getActiveUsers);
route.get('/getActiveUsers', userController.getActiveUsers);
route.get('/', userController.getUser);

module.exports = route;