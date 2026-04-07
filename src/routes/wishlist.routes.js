const { Router } = require('express');
const wishlistController = require('../controllers/wishlist.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { validate } = require('../middlewares/errorHandler');
const validators = require('../utils/validators');

const router = Router();

router.use(auth, role('customer'));

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Obtener favoritos del usuario autenticado
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favoritos del usuario
 *       403:
 *         description: Solo clientes pueden gestionar favoritos
 */
router.get('/', wishlistController.getUserWishlist);

/**
 * @swagger
 * /api/wishlist/items:
 *   post:
 *     summary: Agregar producto a favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 25
 *     responses:
 *       201:
 *         description: Producto agregado a favoritos
 *       200:
 *         description: El producto ya estaba en favoritos
 *       404:
 *         description: Producto no encontrado
 */
router.post('/items', validators.addToWishlist, validate, wishlistController.addItem);

/**
 * @swagger
 * /api/wishlist/items/{productId}:
 *   delete:
 *     summary: Eliminar producto de favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado de favoritos
 *       404:
 *         description: Producto no estaba en favoritos
 */
router.delete('/items/:productId', validators.productIdParam, validate, wishlistController.removeItem);

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   get:
 *     summary: Verificar si un producto está en favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado de favorito para el producto consultado
 */
router.get('/:productId', validators.productIdParam, validate, wishlistController.isInWishlist);

module.exports = router;
