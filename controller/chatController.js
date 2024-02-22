const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const Chat = require('../models/chats');

exports.getDashboard = async(req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'chats.html'));
}

exports.postMessage = async(req, res, next) => {
    console.log('Received POST request for inserting message: ', req.body);
    if(!req.body.trimmedMessage){
        console.log('missing req fields');
        return res.sendStatus(500);
    }

    try{
        const { name, trimmedMessage} = req.body;
        console.log(trimmedMessage, name);

        const data = await Chat.create({
            name:name,
            message:trimmedMessage,
            userId: req.user.id
        });

        console.log('updated success');

        res.status(201).json(data);
    } catch(err){
        console.log(err, JSON.stringify(err));
        res.status(501).json({err});
    }
}

exports.getMessage = async(req, res, next) => {
    try{
        console.log('Received GET request for fetching messages: ', req.body);

        const messages = await Chat.findAll();

        if (!messages || messages.length === 0) {
            return res.json([]);
        }
    
        res.json(messages);
    } catch(err) {
        console.log(err);
        res.status(500).json({ error: 'Internal error' });
    }
}
    