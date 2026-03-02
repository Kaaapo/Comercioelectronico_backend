// Usuarios registrados en la plataforma (clientes y administradores)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre es requerido' },
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: 'Email inválido' },
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        defaultValue: 'customer',
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'email_verified',
    },
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'verification_token',
    },
    verificationTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'verification_token_expires',
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reset_password_token',
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_password_expires',
    },
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
    },
});

User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    delete values.verificationToken;
    delete values.verificationTokenExpires;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    return values;
};

module.exports = User;
