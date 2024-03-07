const express = require('express');

const route = express.Router();
const userAuthenticate = require('../middleware/auth');

const chatController = require('../controller/chatController');

route.get('/dashboard', chatController.getDashboard);

route.post('/message', userAuthenticate.authenticate, chatController.postMessage);
route.get('/getMessages', chatController.getMessage)

route.post('/create-group',userAuthenticate.authenticate, chatController.createGroup);
route.get('/get-group',userAuthenticate.authenticate, chatController.getGroups);
route.post('/add-user-to-group', chatController.addUserToGroup)
route.get('/groupMember', chatController.getGroupMembers)
route.post('/member/make-admin', chatController.makeAdmin);
route.delete('/member/remove-member', chatController.removeMember);

module.exports = route;