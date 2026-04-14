const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
    async register(req, res, next) {
        try {
            const { user, token } = await authService.register(req.body);
            return ApiResponse.created(res, { user, token }, 'Usuario registrado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { user, token } = await authService.login(req.body);
            return ApiResponse.success(res, { user, token }, 'Inicio de sesión exitoso');
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const user = await authService.getProfile(req.user.id);
            return ApiResponse.success(res, { user }, 'Perfil obtenido exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const { address, city, department, phone } = req.body;
            const user = await authService.updateProfile(req.user.id, { address, city, department, phone });
            return ApiResponse.success(res, { user }, 'Perfil actualizado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const { token } = req.query;
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token requerido' });
            }
            const user = await authService.verifyEmail(token);
            return ApiResponse.success(res, { user }, '¡Correo verificado exitosamente! Ya puedes iniciar sesión.');
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            await authService.forgotPassword(req.body.email);
            // Siempre responde igual para no revelar si el correo existe
            return ApiResponse.success(res, null, 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.');
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token } = req.query;
            const { password } = req.body;
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token requerido' });
            }
            await authService.resetPassword(token, password);
            return ApiResponse.success(res, null, 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión.');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
