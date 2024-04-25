//const { io } = require('../app');
const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const Chat = require('../models/chats');
const Group = require('../models/group');
const UserGroup = require('../models/usergroup')
const User = require('../models/user')
const Op = require('sequelize')


exports.getDashboard = async(req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'chats.html'));
}

exports.postMessage = async(data, io) => {
    console.log('Received POST request for inserting message: ', data);
    // if(!data.trimmedMessage){
    //     console.log('missing req fields');
    //     return res.sendStatus(500);
    // }

    
    try{
        const { name, trimmedMessage, groupId, userId} = data;
        console.log('by request: ', trimmedMessage, name, groupId);

        const chatt = await Chat.create({
            name:name,
            message:trimmedMessage,
            userId: userId,
            groupId: groupId
        });

        console.log('updated success');

        io.emit('message', chatt);

        // res.status(201).json(chatt);
    } catch(err){
        console.log(err, JSON.stringify(err));
        // res.status(501).json({err});
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
    try{
        console.log('Group creation request: ', req.body);

        const { gname, participants } = req.body;
        console.log(`group name: ${gname}`);
        console.log('token user : ', req.user);
        const creatorId = req.user.id;
        console.log('isne kiya h create: ', creatorId)

        //const participants = await User.findAll({ where: { id: { [Op.not]: creatorId } } });

        const newGroup = await Group.create({ gname });
    
        console.log('group data inserted in group table');

        await newGroup.addUser(creatorId);

        // Use findOrCreate to ensure the creator is added as admin
        const [userGroup, created] = await UserGroup.findOrCreate({
            where: { userId: creatorId, groupId: newGroup.id },
            defaults: { isAdmin: true }
        });

        if (!created) {
            // If the user group already exists, update the isAdmin field
            userGroup.isAdmin = true;
            await userGroup.save();
        }

        if (participants && participants.length > 0) {
            // Associate the selected participants with the group
            await newGroup.addUsers(participants);
        }
    
    
        res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch(error){
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'An error occurred while creating the group' });
    }
    
}

exports.getGroups = async(req, res, next) => {
    try{
        console.log('get request: ', req.body);

        const groupList = await req.user.getGroups();
    
        res.status(201).json(groupList)
    } catch(err){
        console.log('something went wrong ', err)
        res.status(500).json({error: 'something went wrong'});
    }
    
}

exports.addUserToGroup = async (req, res, next) =>{
    try{
        const {userId, lastClickedGroupId } = req.body;
        console.log(`from request post: userid-${userId}, groupid-${lastClickedGroupId}`);

        res.status(201).json({ message: 'User added to group' });

    } catch(error){
        console.error('Error adding user to group: ', error);
        res.status(500).json({ eror: 'An error occured while adding user to group' });
    }
}

exports.getGroupMembers = async(req, res, next) => {
    try{
        console.log('get request from getmember request: ', req.query);
        const groupId = req.query.groupId;
        console.log('group id: ', groupId);

        const userGroups = await UserGroup.findAll({ where: { groupId: groupId } });
        let adminUserId = 0;
        userGroups.forEach(userGroup => {
            if(userGroup.isAdmin === true){
                adminUserId = userGroup.userId;
            }
        })

        const userIds = userGroups.map(userGroup => userGroup.userId);

        const users = await User.findAll({ where: { id: userIds } });
        console.log('users detail of the group: ', users);
        console.log('admin user id: ', adminUserId);
        const data = {
            adminUserId: adminUserId,
            users: users
            
        }

        res.status(201).json(data);
    } catch(err){
        console.log('error in fetching group members: ', err);
        res.status(500).json({ error: 'error in fetching group members'});

    }
    

}

exports.makeAdmin = async(req, res, next) => {
    try{
        const { userId, groupId } = req.body;
        console.log('making this member admin: ', userId);
        console.log('of this group: ', groupId);

        await UserGroup.update({ isAdmin: true}, {
            where: {
                groupId: groupId,
                userId: userId
            }
        })

        res.status(200).json({message: 'making admin successful'});
    } catch(error){
        console.log('error in making admin: ', error);
        res.status(500).json({error: 'error in making admin'});
    }
    
}

exports.removeMember = async(req, res, next) => {
    try{
        const { userId, groupId } = req.body;
        console.log('removing this member: ', userId);
        console.log('of this group: ', groupId);
        await UserGroup.destroy({
            where: {
                userId: userId,
                groupId: groupId
            }
        });
        res.status(200).json({message: 'member removed successfully'});
    } catch(error){
        console.log('error in removing member: ', error);
        res.status(500).json({error: 'error in removing member'});
    }
}