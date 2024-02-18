const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Chat = sequelize.define('chats', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Chat;