const paymentService = require('../services/payment.service');
const ApiResponse = require('../utils/apiResponse');

class PaymentController {
    async processPayment(req, res, next) {
        try {
            const io = req.app.get('io');
            const result = await paymentService.processPayment(req.body, req.user.id, io);
            const statusCode = result.payment.status === 'aprobado' ? 200 : 402;
            return res.status(statusCode).json({
                success: result.payment.status === 'aprobado',
                message: result.message,
                data: {
                    payment: result.payment,
                    order: result.order,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getByOrderId(req, res, next) {
        try {
            const userId = req.user.role === 'admin' ? null : req.user.id;
            const payments = await paymentService.getByOrderId(req.params.orderId, userId);
            return ApiResponse.success(res, { payments }, 'Pagos obtenidos');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentController();
