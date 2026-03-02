// Orden realizado por un usuario al confirmar su carrito
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'order_number',
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'),
        defaultValue: 'pendiente',
    },
    shippingAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'shipping_address',
    },
}, {
    tableName: 'orders',
    timestamps: true,
    hooks: {
        beforeValidate: (order) => {
            if (!order.orderNumber) {
                const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
                order.orderNumber = `PED-${Date.now().toString().slice(-6)}-${rand}`;
            }
        },
    },
});

module.exports = Order;
