const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Group = sequelize.define('group', {
    gname:{
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Group;