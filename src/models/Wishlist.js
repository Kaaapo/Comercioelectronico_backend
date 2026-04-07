const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wishlist = sequelize.define('Wishlist', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
    },
}, {
    tableName: 'wishlists',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'product_id'],
        },
    ],
});

module.exports = Wishlist;