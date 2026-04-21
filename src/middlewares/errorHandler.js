const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware para manejar errores de validación de express-validator
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));
        return ApiResponse.error(res, 'Errores de validación', 422, extractedErrors);
    }
    next();
};

/**
 * Middleware global de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
    // Solo loguear detalles completos en desarrollo
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    } else {
        // En producción solo loguear mensaje sin stack trace
        console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
    }

    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return ApiResponse.error(res, 'Error de validación en base de datos', 422, errors);
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        const errors = err.errors.map((e) => ({
            field: e.path,
            message: `El valor ya está registrado`,
        }));
        return ApiResponse.error(res, 'Registro duplicado', 409, errors);
    }

    // Body JSON inválido enviado por el cliente
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return ApiResponse.error(res, 'JSON inválido en el cuerpo de la solicitud', 400);
    }

    // Error de CORS
    if (err.message && err.message.startsWith('CORS:')) {
        return ApiResponse.error(res, err.message, 403);
    }

    // En producción nunca exponer mensaje interno de errores no controlados
    const message = process.env.NODE_ENV === 'development'
        ? err.message
        : (err.statusCode && err.statusCode < 500 ? err.message : 'Error interno del servidor');

    return ApiResponse.error(res, message, err.statusCode || 500);
};

module.exports = { validate, errorHandler };
