const express = require('express');
const path = require('path');
const rootDir = require('../util/path');

exports.getDashboard = async(req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'chats.html'));
}