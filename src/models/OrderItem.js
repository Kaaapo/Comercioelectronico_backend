// Producto individual dentro de una orden (detalle de la orden)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'order_id',
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'unit_price',
    },
}, {
    tableName: 'order_items',
    timestamps: false,
});

module.exports = OrderItem;
