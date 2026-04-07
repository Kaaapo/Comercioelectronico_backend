// Categorías que agrupan y clasifican los productos
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'El nombre de la categoría es requerido' },
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'image_url',
        validate: {
            notEmpty: { msg: 'La imagen de la categoría es requerida' },
        },
    },
}, {
    tableName: 'categories',
    timestamps: true,
});

module.exports = Category;
