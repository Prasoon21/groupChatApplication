const path = require('path');
const rootDir = require('../util/path');

exports.getSignUp = async (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'signup.html'));
};

exports.postSignUp = async (req, res, next) => {
    try{
        console.log('Received POST reuest for signing user: ', req.body);

        //const {fname, emailId, phoneNo, passId } = req.body;

        res.status(200).json({success: true, message: "User signed up successfully"});
    } catch(error) {
        console.error("Error Creating User: ", error);
        res.status(500).json({ error: "Error Creating User" });
    }
}