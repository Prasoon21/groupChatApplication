const express = require('express');

const resetPasswordController = require('../controller/resetPasswordController');

const route = express.Router();

route.get('/forgotForm', resetPasswordController.forgotForm);

route.get('/updatepassword/:resetpasswordid', resetPasswordController.updatepassword);

route.get('/resetpassword/:id', resetPasswordController.resetpassword);

route.use('/forgotpassword', resetPasswordController.forgotpassword);

module.exports = route;