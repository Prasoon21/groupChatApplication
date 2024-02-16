const express = require('express');

exports.getDashboard = async(req, res, next) => {
    res.send('<h1>Welcome to the Chat App</h1>');
}