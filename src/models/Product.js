// Productos disponibles para la venta en la tienda
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre del producto es requerido' },
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: { args: [0.01], msg: 'El precio debe ser mayor a 0' },
        },
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: { args: [0], msg: 'El stock no puede ser negativo' },
        },
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'image_url',
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    discountPercentage: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'discount_percentage',
    },
    originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'original_price',
    },
    supplier: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    specifications: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'category_id',
    },
}, {
    tableName: 'products',
    timestamps: true,
});

module.exports = Product;
