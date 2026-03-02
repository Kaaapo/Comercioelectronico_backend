// Producto individual dentro del carrito de compras de un usuario
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'cart_id',
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: { args: [1], msg: 'La cantidad debe ser al menos 1' },
        },
    },
}, {
    tableName: 'cart_items',
    timestamps: true,
});

module.exports = CartItem;
