const path = require('path');
const rootDir = require('../util/path')
const uuid = require('uuid');
const Sib = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const Forgotpassword = require('../models/forgotpassword');


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

        const user = await User.findOne({where : { emailId } });
        if(user){
            const id = uuid.v4();
            user.createForgotpassword({ id, active: true })
            .catch(err => {
                console.error('Error creating forgot password: ', err);
                return res.status(500).json({ message: 'Failed to create forgot password entry', success: false});

            });

            console.log('forgot vali: ', id);
            console.log('we are in: ');
            const client = Sib.ApiClient.instance;
            const apiKey = client.authentications['api-key'];
            apiKey.apiKey = process.env.TEST_API;

            const tranEmailApi = new Sib.TransactionalEmailsApi();

            const sender = {
                email: 'parasharprasoon34@gmail.com'
            }

            const receiver = [ { email: emailId } ]

            console.log('receiver and sender created');

            tranEmailApi.sendTransacEmail({
                sender,
                to: receiver,
                subject: 'Sending with sendinblue is Fun',
                textContent: 'This mail is regarding reset password',
                htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}"><h2>Reset Password</h2></a>`,

            }).then((response) => {
                console.log('API called successfully.');
                console.log('Sendinblue API response:', response);
                if (response && response.messageId) {
                    // Assuming that presence of 'messageId' indicates a successful response
                    return res.status(200).json({ message: 'Link to reset password sent to your mail ', success: true });
                } else {
                    throw new Error('Invalid or missing status code in Sendinblue API response.');
                }
            
                //return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail ', success: true})
            }).catch((error) => {
                throw new Error(error);
            })
        } else{
            throw new Error('User does not exist');
        }

    } catch(err){
        console.error(err);
        return res.json({message: err, success: false});
    }
}

exports.resetpassword = (req, res) => {
    const id = req.params.id;
    console.log('id: ', id);
    Forgotpassword.findOne({ where : { id } }).then(forgotpasswordrequest => {
        console.log('kis id par hoga: ', forgotpasswordrequest)
        if(forgotpasswordrequest){
            forgotpasswordrequest.update({ active: false });
            res.status(200).send(`<html>
                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }    
                                    </script>
                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter New Password</label>
                                        <input name="newpassword" type="password" required>
                                        <button>reset password</button>
                                    </form>
                                    </html>`
                                )
            res.end()
        }
    })
}

exports.updatepassword = (req, res) => {
    try{
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where : { id: resetpasswordid } }).then(resetpasswordrequest => {
            User.findOne({where: { id : resetpasswordrequest.userId } }).then(user => {
                if(user) {
                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function(err, salt) {
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, function(err, hash) {
                            if(err){
                                console.log(err);
                                throw new Error(err);
                            }
                            user.update({ passId: hash }).then(() => {
                                res.status(201).json({message: 'Successfully update the new password'})
                            })
                        });
                    });
                } else{
                    return res.status(404).json({ error: 'No User Exists', success: false})

                }
            })
        })
    } catch(err){
        return res.status(403).json({ error, success: false})

    }
}