const orderService = require('../services/order.service');
const ApiResponse = require('../utils/apiResponse');

class OrderController {
    async create(req, res, next) {
        try {
            const io = req.app.get('io');
            const order = await orderService.createFromCart(req.user.id, req.body, io);
            return ApiResponse.created(res, { order }, 'Orden creada exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async getMyOrders(req, res, next) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const { orders, total } = await orderService.getByUser(req.user.id, { page, limit });
            return ApiResponse.paginated(res, orders, total, page, limit, 'Mis pedidos');
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            // Si es admin, puede ver cualquier orden. Si es customer, solo las suyas.
            const userId = req.user.role === 'admin' ? null : req.user.id;
            const order = await orderService.getById(req.params.id, userId);
            return ApiResponse.success(res, { order });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const { orders, total } = await orderService.getAll({ page, limit, status });
            return ApiResponse.paginated(res, orders, total, page, limit, 'Todas las órdenes');
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const io = req.app.get('io');
            const order = await orderService.updateStatus(req.params.id, req.body.status, io);
            return ApiResponse.success(res, { order }, 'Estado de la orden actualizado');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrderController();
