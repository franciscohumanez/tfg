const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AccountAnalyticLine = sequelize.define('AccountAnalyticLine', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    task_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_time: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'account_analytic_line',
    timestamps: false
});

module.exports = AccountAnalyticLine;
