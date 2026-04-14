const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Cart } = require('../models');
const { sendVerificationEmail, sendResetPasswordEmail } = require('./email.service');

class AuthService {
    async register({ name, identificationNumber, birthDate, address, city, department, email, password, phone }) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            const error = new Error('El email ya está registrado');
            error.statusCode = 409;
            throw error;
        }

        const existingId = await User.findOne({ where: { identificationNumber } });
        if (existingId) {
            const error = new Error('El número de identificación ya está registrado');
            error.statusCode = 409;
            throw error;
        }

        // Generar token de verificación (expira en 24h)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // El rol siempre es 'customer' en el registro público
        const user = await User.create({
            name, identificationNumber, birthDate, address, city, department,
            email, password, phone: phone || null,
            role: 'customer',
            verificationToken,
            verificationTokenExpires,
        });

        await Cart.create({ userId: user.id });

        // Enviar correo de verificación (no bloquea el registro si falla)
        sendVerificationEmail(email, name, verificationToken)
            .catch(err => console.error('[Email] Error al enviar verificación:', err.message));

        const token = this.generateToken(user);
        return { user, token };
    }

    async login({ email, password }) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            const error = new Error('Credenciales inválidas');
            error.statusCode = 401;
            throw error;
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            const error = new Error('Credenciales inválidas');
            error.statusCode = 401;
            throw error;
        }

        const token = this.generateToken(user);
        return { user, token };
    }

    async getProfile(userId) {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires', 'resetPasswordToken', 'resetPasswordExpires'] },
        });
        if (!user) {
            const error = new Error('Usuario no encontrado');
            error.statusCode = 404;
            throw error;
        }
        return user;
    }

    async updateProfile(userId, { address, city, department, phone }) {
        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('Usuario no encontrado');
            error.statusCode = 404;
            throw error;
        }

        const updateData = {};
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (department !== undefined) updateData.department = department;
        if (phone !== undefined) updateData.phone = phone;

        await user.update(updateData);

        // Retornar usuario sin datos sensibles
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires', 'resetPasswordToken', 'resetPasswordExpires'] },
        });
        return updatedUser;
    }

    async verifyEmail(token) {
        const user = await User.findOne({ where: { verificationToken: token } });

        if (!user) {
            const error = new Error('Token de verificación inválido');
            error.statusCode = 400;
            throw error;
        }

        if (new Date() > user.verificationTokenExpires) {
            const error = new Error('El token de verificación ha expirado');
            error.statusCode = 400;
            throw error;
        }

        await user.update({
            emailVerified: true,
            verificationToken: null,
            verificationTokenExpires: null,
        });

        return user;
    }

    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });

        // Por seguridad, no revelamos si el correo existe o no
        if (!user) return;

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await user.update({ resetPasswordToken: resetToken, resetPasswordExpires });
        await sendResetPasswordEmail(email, user.name, resetToken);
    }

    async resetPassword(token, newPassword) {
        const user = await User.findOne({ where: { resetPasswordToken: token } });

        if (!user) {
            const error = new Error('Token inválido o expirado');
            error.statusCode = 400;
            throw error;
        }

        if (new Date() > user.resetPasswordExpires) {
            const error = new Error('El enlace de recuperación ha expirado');
            error.statusCode = 400;
            throw error;
        }

        await user.update({
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        return user;
    }

    generateToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
    }
}

module.exports = new AuthService();
