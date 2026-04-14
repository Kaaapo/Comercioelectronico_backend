const { body, param, query } = require('express-validator');

const validators = {
    // Auth
    register: [
        body('name')
            .trim()
            .notEmpty().withMessage('El nombre completo es requerido')
            .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/).withMessage('El nombre solo puede contener letras y espacios')
            .custom((value) => {
                const words = value.trim().split(/\s+/);
                if (words.length < 2) {
                    throw new Error('Debe ingresar nombre y apellido');
                }
                for (const word of words) {
                    if (word.length < 2) {
                        throw new Error('Cada parte del nombre debe tener al menos 2 caracteres');
                    }
                }
                return true;
            }),
        body('identificationNumber')
            .trim()
            .notEmpty().withMessage('El número de identificación es requerido')
            .matches(/^[A-Za-z0-9]+$/).withMessage('El número de identificación solo puede contener letras y dígitos')
            .isLength({ min: 4, max: 20 }).withMessage('El número de identificación debe tener entre 4 y 20 caracteres'),
        body('birthDate')
            .notEmpty().withMessage('La fecha de nacimiento es requerida')
            .isDate({ format: 'YYYY-MM-DD', strictMode: true }).withMessage('La fecha de nacimiento debe tener el formato YYYY-MM-DD')
            .custom((value) => {
                const birth = new Date(value);
                const today = new Date();
                if (birth >= today) {
                    throw new Error('La fecha de nacimiento debe ser anterior a hoy');
                }
                const age = today.getFullYear() - birth.getFullYear();
                const monthDiff = today.getMonth() - birth.getMonth();
                const realAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
                    ? age - 1 : age;
                if (realAge < 18) {
                    throw new Error('Debes tener al menos 18 años para registrarte');
                }
                if (realAge > 120) {
                    throw new Error('La fecha de nacimiento no es válida');
                }
                return true;
            }),
        body('address').trim().notEmpty().withMessage('La dirección es requerida'),
        body('city').trim().notEmpty().withMessage('La ciudad es requerida'),
        body('department').trim().notEmpty().withMessage('El departamento es requerido'),
        body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
        body('phone')
            .optional()
            .trim()
            .matches(/^\+?[\d\s\-().]{7,20}$/)
            .withMessage('El número de teléfono no es válido (incluye código de país, ej: +573001234567)'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres'),
    ],

    updateProfile: [
        body('address').optional().trim().notEmpty().withMessage('La dirección no puede estar vacía'),
        body('city').optional().trim().notEmpty().withMessage('La ciudad no puede estar vacía'),
        body('department').optional().trim().notEmpty().withMessage('El departamento no puede estar vacío'),
        body('phone')
            .optional()
            .trim()
            .matches(/^\+?[\d\s\-().]{7,20}$/)
            .withMessage('El número de teléfono no es válido'),
    ],

    // Returns
    createReturn: [
        body('orderId')
            .notEmpty().withMessage('El ID de la orden es requerido')
            .isInt({ min: 1 }).withMessage('El ID de la orden debe ser un número válido'),
        body('orderItemId')
            .notEmpty().withMessage('El ID del ítem de la orden es requerido')
            .isInt({ min: 1 }).withMessage('El ID del ítem debe ser un número válido'),
        body('quantity')
            .notEmpty().withMessage('La cantidad es requerida')
            .isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
        body('reason')
            .notEmpty().withMessage('El motivo de devolución es requerido')
            .isIn(['defecto_fabricacion', 'daño_envio', 'producto_incorrecto', 'no_cumple_expectativas', 'otro'])
            .withMessage('Motivo inválido. Valores permitidos: defecto_fabricacion, daño_envio, producto_incorrecto, no_cumple_expectativas, otro'),
        body('description')
            .trim()
            .notEmpty().withMessage('La descripción del problema es requerida')
            .isLength({ min: 10, max: 1000 }).withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
    ],

    updateReturnStatus: [
        body('status')
            .notEmpty().withMessage('El estado es requerido')
            .isIn(['en_revision', 'aprobada', 'rechazada', 'completada'])
            .withMessage('Estado inválido. Valores permitidos: en_revision, aprobada, rechazada, completada'),
        body('adminComment')
            .optional()
            .trim()
            .isLength({ max: 500 }).withMessage('El comentario no puede superar los 500 caracteres'),
    ],

    // Reviews
    createReview: [
        body('rating')
            .notEmpty().withMessage('La calificación es requerida')
            .isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser un número entero entre 1 y 5'),
        body('comment')
            .optional()
            .trim()
            .isLength({ max: 1000 }).withMessage('El comentario no puede superar los 1000 caracteres'),
    ],

    login: [
        body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
        body('password').notEmpty().withMessage('La contraseña es requerida'),
    ],

    // Products
    createProduct: [
        body('name').trim().notEmpty().withMessage('El nombre del producto es requerido'),
        body('description').optional().trim(),
        body('brand').optional().trim().notEmpty().withMessage('La marca no puede estar vacía'),
        body('color').optional().trim().notEmpty().withMessage('El color no puede estar vacío'),
        body('price')
            .isFloat({ min: 0.01 })
            .withMessage('El precio debe ser mayor a 0'),
        body('stock')
            .isInt({ min: 0 })
            .withMessage('El stock debe ser un número entero positivo'),
        body('categoryId')
            .isInt({ min: 1 })
            .withMessage('La categoría es requerida'),
        body('featured')
            .optional()
            .isBoolean()
            .withMessage('Featured debe ser booleano'),
        body('imageUrl').optional().isURL().withMessage('URL de imagen inválida'),
        body('originalPrice')
            .optional()
            .isFloat({ min: 0.01 })
            .withMessage('El precio original debe ser mayor a 0'),
        body('discountPercentage')
            .optional()
            .isInt({ min: 0, max: 100 })
            .withMessage('El descuento debe ser un entero entre 0 y 100'),
        body('supplier')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('El proveedor no puede estar vacío'),
        body('specifications')
            .optional()
            .isObject()
            .withMessage('Las especificaciones deben ser un objeto clave-valor'),
    ],

    updateProduct: [
        param('id').isInt().withMessage('ID de producto inválido'),
        body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
        body('brand').optional().trim().notEmpty().withMessage('La marca no puede estar vacía'),
        body('color').optional().trim().notEmpty().withMessage('El color no puede estar vacío'),
        body('price')
            .optional()
            .isFloat({ min: 0.01 })
            .withMessage('El precio debe ser mayor a 0'),
        body('stock')
            .optional()
            .isInt({ min: 0 })
            .withMessage('El stock debe ser un número entero positivo'),
        body('categoryId')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Categoría inválida'),
        body('active')
            .optional()
            .isBoolean()
            .withMessage('Active debe ser booleano'),
        body('featured')
            .optional()
            .isBoolean()
            .withMessage('Featured debe ser booleano'),
        body('originalPrice')
            .optional()
            .isFloat({ min: 0.01 })
            .withMessage('El precio original debe ser mayor a 0'),
        body('discountPercentage')
            .optional()
            .isInt({ min: 0, max: 100 })
            .withMessage('El descuento debe ser un entero entre 0 y 100'),
        body('supplier')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('El proveedor no puede estar vacío'),
        body('specifications')
            .optional()
            .isObject()
            .withMessage('Las especificaciones deben ser un objeto clave-valor'),
    ],

    // Categories
    createCategory: [
        body('name').trim().notEmpty().withMessage('El nombre de la categoría es requerido'),
        body('description').optional().trim(),
    ],

    // Wishlist
    addToWishlist: [
        body('productId')
            .notEmpty().withMessage('El ID del producto es requerido')
            .isInt({ min: 1 }).withMessage('El ID del producto debe ser un número válido'),
    ],

    productIdParam: [
        param('productId')
            .isInt({ min: 1 })
            .withMessage('ID de producto inválido'),
    ],

    // Cart
    addCartItem: [
        body('productId')
            .isInt({ min: 1 })
            .withMessage('El ID del producto es requerido'),
        body('quantity')
            .isInt({ min: 1 })
            .withMessage('La cantidad debe ser al menos 1'),
    ],

    updateCartItem: [
        param('id').isInt().withMessage('ID de item inválido'),
        body('quantity')
            .isInt({ min: 1 })
            .withMessage('La cantidad debe ser al menos 1'),
    ],

    // Orders
    createOrder: [
        body('shippingAddress')
            .trim()
            .notEmpty()
            .withMessage('La dirección de envío es requerida'),
    ],

    updateOrderStatus: [
        param('id').isInt().withMessage('ID de orden inválido'),
        body('status')
            .isIn(['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'])
            .withMessage('Estado inválido. Valores permitidos: pendiente, procesando, enviado, entregado, cancelado'),
    ],

    // Payments
    processPayment: [
        body('orderId')
            .isInt({ min: 1 })
            .withMessage('El ID de la orden es requerido'),
        body('method')
            .isIn(['tarjeta', 'transferencia', 'paypal', 'pse', 'contraentrega'])
            .withMessage('Método de pago inválido. Valores permitidos: tarjeta, transferencia, paypal, pse, contraentrega'),
    ],

    // Pagination
    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('La página debe ser un número positivo'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('El límite debe ser entre 1 y 100'),
    ],

    // Param ID
    paramId: [
        param('id').isInt({ min: 1 }).withMessage('ID inválido'),
    ],
};

module.exports = validators;
