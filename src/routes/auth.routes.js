const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');
const { validate } = require('../middlewares/errorHandler');
const validators = require('../utils/validators');

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, identificationNumber, birthDate, address, city, department, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               identificationNumber:
 *                 type: string
 *                 example: '1234567890'
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: '1995-06-15'
 *               address:
 *                 type: string
 *                 example: Calle 123 #45-67
 *               city:
 *                 type: string
 *                 example: Bogotá
 *               department:
 *                 type: string
 *                 example: Cundinamarca
 *               email:
 *                 type: string
 *                 example: juan@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       409:
 *         description: Email ya registrado
 */
router.post('/register', validators.register, validate, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validators.login, validate, authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 */
router.get('/profile', auth, authController.getProfile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Actualizar perfil del usuario (dirección, ciudad, departamento, teléfono)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 example: Calle 123 #45-67
 *               city:
 *                 type: string
 *                 example: Bogotá
 *               department:
 *                 type: string
 *                 example: Cundinamarca
 *               phone:
 *                 type: string
 *                 example: +573001234567
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       401:
 *         description: No autenticado
 */
router.put('/profile', auth, validators.updateProfile, validate, authController.updateProfile);

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verificar correo electrónico
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación enviado al correo
 *     responses:
 *       200:
 *         description: Correo verificado exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@gmail.com
 *     responses:
 *       200:
 *         description: Correo enviado si el email existe
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token recibido en el correo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 example: nuevaContrasena123
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;
