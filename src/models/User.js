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
            notEmpty: { msg: 'El nombre completo es requerido' },
        },
    },
    identificationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'identification_number',
        validate: {
            notEmpty: { msg: 'El número de identificación es requerido' },
        },
    },
    birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'birth_date',
        validate: {
            isDate: { msg: 'La fecha de nacimiento debe ser una fecha válida' },
            isBefore: {
                args: new Date().toISOString().split('T')[0],
                msg: 'La fecha de nacimiento debe ser anterior a hoy',
            },
        },
    },
    age: {
        type: DataTypes.VIRTUAL,
        get() {
            if (!this.birthDate) return null;
            const today = new Date();
            const birth = new Date(this.birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        },
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La dirección es requerida' },
        },
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'La ciudad es requerida' },
        },
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El departamento es requerido' },
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
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            is: {
                args: /^\+?[\d\s\-().]{7,20}$/,
                msg: 'El número de teléfono no es válido',
            },
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
