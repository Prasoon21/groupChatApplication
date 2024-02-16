const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
    fname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    emailId:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    phoneNo:{
        type:Sequelize.STRING,
        allowNull: false
    },
    passId:{
        type:Sequelize.STRING,
        allowNull:false
    },
    loggedIn: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = User;