const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const UserGroup = sequelize.define('UserGroup', {
    

    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'users', 
            key: 'id'       
        }
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'groups', 
            key: 'id' 
        }
    }, 
    isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = UserGroup;