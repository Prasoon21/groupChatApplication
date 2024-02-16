const path = require('path');
const rootDir = require('../util/path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userController = require('./userController');

const User = require('../models/user');

exports.generateAccessToken = (id, name, emailId, loggedIn) => {
    return jwt.sign({ userId: id, name: name, emailId: emailId, loggedIn: loggedIn}, process.env.TOKEN_SECRET);
};

exports.postLogin = async(req, res, next) => {
    try{
        console.log('Received Post for login: ', req.body);
        const {emailId, passId} = req.body;

        if(!emailId){
            console.log("emailId is missing");
            return res.status(400).json({ error: "emailId is missing", message: "emailId is missing" });

        }

        const user = await User.findOne({ where: { emailId }});

        if(user){
            bcrypt.compare(passId, user.passId, async (err, result) => {
                if(err){
                    console.log('ye error h: ', err);
                    res.status(500).json({success: false, message: 'something went wrong'});
                }
                else if(result === true){
                    await User.update({ loggedIn: true }, { where: { emailId } });
                    res.status(200).json({success: true, message: 'User logged in successfully', token: userController.generateAccessToken(user.id, user.fname, user.emailId, user.loggedIn)});
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

        res.status(200).json({ success: true, message: 'User logged out successfully' });

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

        const existingUser = await User.findOne({
            where: { emailId: emailId }
        });

        console.log('Existing User: ', existingUser);

        if(existingUser){
            console.error("emailId already in use");
            return res.status(400).json({ error: "emailId already in use", message:"emailId already in use"});

        }

        console.log('ye number kesa h:', typeof(phoneNo));
        const hashedPassword = await new Promise((resolve, reject) => {
            bcrypt.hash(passId, 10, (err, hash) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(hash);
                }
            });
        });

        await User.create({
            fname: fname,
            emailId: emailId,
            phoneNo: phoneNo,
            passId: hashedPassword
        });

        console.log('updated success');
        res.status(201).json({message: 'Successfully Create new user'});
    } catch(error) {
        console.error("Error Creating User: ", error);
        res.status(500).json({ error: "Error Creating User" });
    }
}

