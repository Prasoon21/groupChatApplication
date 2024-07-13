const getDb = require('../util/database').getDb;

class User {
    constructor(fname, emailId, phoneNo, passId, loggedIn) {
        this.fname = fname;
        this.emailId = emailId;
        this.phoneNo = phoneNo;
        this.passId = passId;
        this.loggedIn = loggedIn;
    }
    
    save() {
        const db = getDb();
        return db.collection('user')
        .insertOne(this)
        .then(result => {
            console.log('Result: ', result);
        })
        .catch(err => {
            console.log(err);
        });
    }
}

// const User = sequelize.define('user', {
//     fname: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     emailId:{
//         type:Sequelize.STRING,
//         allowNull:false,
//         unique:true
//     },
//     phoneNo:{
//         type:Sequelize.STRING,
//         allowNull: false
//     },
//     passId:{
//         type:Sequelize.STRING,
//         allowNull:false
//     },
//     loggedIn: {
//         type: Sequelize.BOOLEAN,
//         defaultValue: false
//     }
// });

module.exports = User;