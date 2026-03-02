// Pago asociado a un pedido: método, monto y estado de la transacción
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'order_id',
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    method: {
        type: DataTypes.ENUM('tarjeta', 'transferencia', 'paypal'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
        defaultValue: 'pendiente',
    },
    transactionId: {
        type: DataTypes.STRING,
        unique: true,
        field: 'transaction_id',
        defaultValue: () => `TXN-${uuidv4().substring(0, 12).toUpperCase()}`,
    },
}, {
    tableName: 'payments',
    timestamps: true,
});

module.exports = Payment;
