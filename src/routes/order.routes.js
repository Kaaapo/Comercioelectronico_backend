const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { validate } = require('../middlewares/errorHandler');
const validators = require('../utils/validators');

const router = Router();

// Todas las rutas de órdenes requieren autenticación
router.use(auth);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear orden desde el carrito
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress]
 *             properties:
 *               shippingAddress:
 *                 type: string
 *                 example: Calle 123, Ciudad, País
 *     responses:
 *       201:
 *         description: Orden creada
 */
router.post('/', role('customer'), validators.createOrder, validate, orderController.create);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Obtener mis pedidos (customer)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', role('customer'), validators.pagination, validate, orderController.getMyOrders);

/**
 * @swagger
 * /api/orders/all:
 *   get:
 *     summary: Obtener todos los pedidos (admin)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendiente, procesando, enviado, entregado, cancelado]
 */
router.get('/all', role('admin'), validators.pagination, validate, orderController.getAll);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener detalle de un pedido
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', validators.paramId, validate, orderController.getById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Actualizar estado del pedido (admin) - Emite WebSocket
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendiente, procesando, enviado, entregado, cancelado]
 *     responses:
 *       200:
 *         description: Estado actualizado (evento WebSocket emitido al usuario)
 */
router.put('/:id/status', role('admin'), validators.updateOrderStatus, validate, orderController.updateStatus);

module.exports = router;
