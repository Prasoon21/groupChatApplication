const path = require('path');
const { Op } = require('sequelize')
const rootDir = require('../util/path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userController = require('./userController');

let activeUsers = [];

const User = require('../models/user');
// const Group = require('../models/group');
// const Chat = require('../models/chats');

exports.generateAccessToken = (id, name, emailId, loggedIn) => {
    return jwt.sign({ userId: id, name: name, emailId: emailId, loggedIn: loggedIn}, process.env.TOKEN_SECRET);
};

exports.postLogin = async(req, res, next) => {
    try{
        console.log('Received Post for login: ', req.body.emailId);
        const {emailId, passId} = req.body;
        console.log('email aana chahiye: ', emailId);
        if(!emailId){
            console.log("emailId is missing");
            return res.status(400).json({ error: "emailId is missing", message: "emailId is missing" });

        }

        const user = await User.findOne({ where: { emailId }});
        console.log('user login: ', user);

        if(user){
            bcrypt.compare(passId, user.passId, async (err, result) => {
                if(err){
                    console.log('ye error h: ', err);
                    res.status(500).json({success: false, message: 'something went wrong'});
                }
                else if(result === true){
                    await User.update({ loggedIn: true }, { where: { emailId } });
                    activeUsers.push(user.id);
                    
                    for(const active of activeUsers){
                        console.log('active userId after login: ', active);
                    }
                    
                    res.status(200).json({success: true, message: 'User logged in successfully', activeUsers: activeUsers, token: userController.generateAccessToken(user.id, user.fname, user.emailId, user.loggedIn)});
                }
                else{
                    console.log("Password not match");
                    return res.status(401).json({ error: "Password incorrect", message: "Password incorrect" });
                }
            })
        } else{
            console.log("emailId not found");
            return res.status(404).json({ error: "emailId not found", message: "emailId not found" });
        }
    } catch(error){
        console.error("Error in login User: ", error);
        res.status(500).json({ error: "Error in login User" });
    }
};

exports.getLogin = async(req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'login.html'));
};

exports.postLogout = async(req, res, next) => {
    try{
        const { emailId } = req.body;
        console.log('email: ', emailId);
        if(!emailId){
            console.log("emailId is missing");
            return res.status(400).json({ error: "emailId is missing", message: "emailId is missing" });
        }
        

        await User.update({ loggedIn: false}, { where: { emailId } });
        
        const user = await User.findOne({ where: { emailId }});
        console.log('user jisne logout kiya: ', user);
        
        const index = activeUsers.indexOf(user.id);
        console.log('index: ', index);
        if(index !== -1){
            activeUsers.splice(index, 1);
            console.log('after checking: ', activeUsers)
        }

        for(const active of activeUsers){
            console.log('active userId after logout: ', active);
        }

        res.status(200).json({ success: true, message: 'User logged out successfully', activeUsers: activeUsers });

    } catch(err) {
        console.error("Error in logout User: ", err);
        res.status(500).json({ error: "Error in logout User" });
    }
};

exports.getSignUp = async (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'signup.html'));
};

exports.postSignUp = async (req, res, next) => {
    try{
        console.log('Received POST request for signing user: ', req.body);
        
        const {fname, emailId, passId } = req.body;

        const phoneNo = parseInt(req.body.phoneNo);

        // const existingUser = await User.findOne({
        //     where: { emailId: emailId }
        // });

        //console.log('Existing User: ', existingUser);

        // if(existingUser){
        //     console.error("emailId already in use");
        //     return res.status(400).json({ error: "emailId already in use", message:"emailId already in use"});

        // }

        //console.log('ye number kesa h:', typeof(phoneNo));
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(passId, 10, (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            });
        });
        const user = new User(fname, emailId, phoneNo, hashedPassword)
        await user.save()
        .then(result => {
            console.log('Result: ', result);
        }).catch(err => {
            console.log(err);
        });

        console.log('updated success');
        res.status(201).json({message: 'Successfully Create new user'});
    } catch(error) {
        console.error("Error Creating User: ", error);
        res.status(500).json({ error: "Error Creating User" });
    }
}

exports.getActiveUsers = async(req, res, next) => {
    const activeUsersFromDB = await User.findAll({ where: { loggedIn: true } });

    const activeUsersWithName = activeUsersFromDB.map(user => ({ id: user.id, name: user.fname}));


    console.log('getting active users: ', activeUsersFromDB);
    console.log('names of active: ', activeUsersWithName);
    res.json(activeUsersFromDB);
}

exports.getUser = async(req, res, next) => {
    try{
        const allUsers = await User.findAll();

        res.status(201).json(allUsers);
    } catch(err){
        console.log('something wrong in fetching users: ', err);
        res.status(500).json({error: 'something went wrong'});
    }
    

}

exports.getUserGroup = async(req, res, next) => {
    const userId = parseInt(req.params.userId);

    try{
        const userGroups = await Group.findAll({
            // include: [{
            //     model: User,
            //     where: { userId },
                
            // }]
        });
        res.json({ userGroups });
    } catch(err){
        console.error('Error fetching user groups: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.searchUsers = async(req, res, next) => {
    try{
        const { query } = req.query;
        console.log('request se: ', query);
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { fname: { [Op.like]: `%${query}%` } },
                    { emailId: { [Op.like]: `%${query}%` } },
                    { phoneNo: { [Op.like]: `%${query}%` } }
                ]
            }
        });
        res.status(200).json(users);
    } catch(error){
        console.error('Error searching users: ', error);
        res.status(500).json({ error: 'An error occured while searching for users' });
        
    }
}