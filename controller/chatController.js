const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const Chat = require('../models/chats');
const Group = require('../models/group');

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
        const { name, trimmedMessage, groupId} = req.body;
        console.log(trimmedMessage, name, groupId);

        const data = await Chat.create({
            name:name,
            message:trimmedMessage,
            userId: req.user.id,
            groupId: groupId
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
  

exports.createGroup = async(req, res, next) => {
    console.log('Group creation request: ', req.body);

    const gname = req.body.gname;
    const groupData = await Group.create({
        gname: gname
    });

    console.log('group data inserted in group table');


    res.status(201).json(groupData);
}

exports.getGroups = async(req, res, next) => {
    try{
        console.log('get request: ', req.body);

        const groupList = await Group.findAll();
    
        res.status(201).json(groupList)
    } catch(err){
        console.log('something went wrong ', err)
        res.status(500).json({error: 'something went wrong'});
    }
    
}