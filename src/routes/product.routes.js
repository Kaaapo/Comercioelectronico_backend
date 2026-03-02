const { Router } = require('express');
const productController = require('../controllers/product.controller');
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const { validate } = require('../middlewares/errorHandler');
const validators = require('../utils/validators');
const { upload } = require('../services/cloudinary.service');

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar productos con filtros y paginación
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Productos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', validators.pagination, validate, productController.getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener detalle de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del producto
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', validators.paramId, validate, productController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un producto (Solo admin)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price, stock, categoryId]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del producto (jpg, png, webp - máx 5MB)
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Producto creado
 *       403:
 *         description: Sin permisos
 */
router.post('/', auth, role('admin'), upload.single('image'), validators.createProduct, validate, productController.create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto (Solo admin)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Nueva imagen del producto (reemplaza la anterior)
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
router.put('/:id', auth, role('admin'), upload.single('image'), validators.updateProduct, validate, productController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto (Solo admin, soft-delete)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 */
router.delete('/:id', auth, role('admin'), validators.paramId, validate, productController.delete);

module.exports = router;
