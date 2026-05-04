const { Return, Order, OrderItem, Product, User } = require('../models');

class ReturnService {
    // Usuario solicita una devolución
    async createReturn(userId, { orderId, orderItemId, quantity, reason, description }) {
        // Verificar que la orden pertenece al usuario
        const order = await Order.findOne({ where: { id: orderId, userId } });
        if (!order) {
            const error = new Error('Orden no encontrada');
            error.statusCode = 404;
            throw error;
        }

        // Solo se pueden devolver órdenes entregadas
        if (order.status !== 'entregado') {
            const error = new Error('Solo se pueden devolver productos de órdenes con estado "entregado"');
            error.statusCode = 400;
            throw error;
        }

        // Verificar que el item pertenece a la orden
        const orderItem = await OrderItem.findOne({ where: { id: orderItemId, orderId } });
        if (!orderItem) {
            const error = new Error('El producto no pertenece a esta orden');
            error.statusCode = 404;
            throw error;
        }

        // Validar que la cantidad a devolver no supere la comprada
        if (quantity > orderItem.quantity) {
            const error = new Error(`La cantidad a devolver (${quantity}) no puede superar la cantidad comprada (${orderItem.quantity})`);
            error.statusCode = 400;
            throw error;
        }

        // Verificar que no exista ya una devolución activa para este item
        const existingReturn = await Return.findOne({
            where: {
                userId,
                orderItemId,
                status: ['solicitada', 'en_revision', 'aprobada'],
            },
        });
        if (existingReturn) {
            const error = new Error('Ya existe una solicitud de devolución activa para este producto');
            error.statusCode = 409;
            throw error;
        }

        const returnRequest = await Return.create({
            userId,
            orderId,
            orderItemId,
            quantity,
            reason,
            description,
        });

        return returnRequest;
    }

    // Usuario ve sus propias devoluciones
    async getUserReturns(userId) {
        return Return.findAll({
            where: { userId },
            include: [
                {
                    model: Order,
                    as: 'order',
                    attributes: ['id', 'orderNumber', 'total', 'status'],
                },
                {
                    model: OrderItem,
                    as: 'orderItem',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl'] }],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
    }

    // Usuario ve el detalle de una devolución suya
    async getReturnById(userId, returnId) {
        const returnRequest = await Return.findOne({
            where: { id: returnId, userId },
            include: [
                { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'total', 'status', 'shippingAddress'] },
                {
                    model: OrderItem,
                    as: 'orderItem',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'imageUrl'] }],
                },
            ],
        });
        if (!returnRequest) {
            const error = new Error('Solicitud de devolución no encontrada');
            error.statusCode = 404;
            throw error;
        }
        return returnRequest;
    }

    // Usuario cancela su solicitud (solo si está en estado 'solicitada')
    async cancelReturn(userId, returnId) {
        const returnRequest = await Return.findOne({ where: { id: returnId, userId } });
        if (!returnRequest) {
            const error = new Error('Solicitud de devolución no encontrada');
            error.statusCode = 404;
            throw error;
        }
        if (returnRequest.status !== 'solicitada') {
            const error = new Error('Solo puedes cancelar solicitudes en estado "solicitada"');
            error.statusCode = 400;
            throw error;
        }
        await returnRequest.destroy();
    }

    // ===================== ADMIN =====================

    // Admin ve todas las devoluciones
    async getAllReturns({ status, page = 1, limit = 10 }) {
        const where = {};
        if (status) where.status = status;

        const offset = (page - 1) * limit;
        const { count, rows } = await Return.findAndCountAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Order, as: 'order', attributes: ['id', 'orderNumber', 'total'] },
                {
                    model: OrderItem,
                    as: 'orderItem',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl'] }],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset,
        });

        return { returns: rows, total: count, page: parseInt(page), limit: parseInt(limit) };
    }

    // Admin actualiza el estado de una devolución
    async updateReturnStatus(returnId, { status, adminComment }) {
        const returnRequest = await Return.findByPk(returnId, {
            include: [{
                model: OrderItem,
                as: 'orderItem',
                include: [{ model: Product, as: 'product' }],
            }],
        });

        if (!returnRequest) {
            const error = new Error('Solicitud de devolución no encontrada');
            error.statusCode = 404;
            throw error;
        }

        await returnRequest.update({ status, adminComment });

        // Si se aprueba o completa la devolución, restaurar stock del producto
        if ((status === 'aprobada' || status === 'completada') && returnRequest.orderItem?.product) {
            const product = returnRequest.orderItem.product;
            await product.update({
                stock: product.stock + returnRequest.quantity,
            });
        }

        return returnRequest;
    }
}

module.exports = new ReturnService();
