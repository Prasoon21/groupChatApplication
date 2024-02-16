const path = require('path');
const rootDir = require('../util/path')

exports.forgotForm = async(req, res, next)  => {
    try{
        res.sendFile(path.join(rootDir, 'views', 'forgotForm.html'));

    } catch(err){
        console.log('error in getting html file: ', err);
    }
}

exports.forgotpassword = async(req, res, next) => {
    try{
        const emailId = req.body.emailId;
        console.log('entered email: ', emailId);

        res.status(200).json({message: 'Link for password reset sent to you', success: true});

    } catch(err){
        console.error(err);
        return res.json({message: err, success: false});
    }
}