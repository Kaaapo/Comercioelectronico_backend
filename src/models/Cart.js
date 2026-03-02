// Carrito de compras asociado a un usuario (uno por usuario)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'user_id',
    },
}, {
    tableName: 'carts',
    timestamps: true,
});

module.exports = Cart;
