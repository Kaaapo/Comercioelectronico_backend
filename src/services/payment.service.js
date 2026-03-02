const { Payment, Order } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { emitNotification } = require('../sockets/orderSocket');

class PaymentService {
    /**
     * Simula el procesamiento de un pago
     * Genera un transaction_id único y aplica lógica de aprobación/rechazo
     */
    async processPayment({ orderId, method }, userId, io) {
        // Verificar que la orden existe y pertenece al usuario
        const order = await Order.findOne({ where: { id: orderId, userId } });
        if (!order) {
            const error = new Error('Orden no encontrada');
            error.statusCode = 404;
            throw error;
        }

        if (order.status === 'cancelado') {
            const error = new Error('No se puede pagar una orden cancelada');
            error.statusCode = 400;
            throw error;
        }

        // Verificar que no exista un pago previo aprobado
        const existingPayment = await Payment.findOne({
            where: { orderId, status: 'aprobado' },
        });
        if (existingPayment) {
            const error = new Error('Esta orden ya tiene un pago aprobado');
            error.statusCode = 400;
            throw error;
        }

        // Simular delay de procesamiento (300ms - 1500ms)
        await this.simulateDelay();

        // Determinar si se aprueba o rechaza
        const approvalRate = parseInt(process.env.PAYMENT_APPROVAL_RATE) || 80;
        const isApproved = Math.random() * 100 < approvalRate;
        const status = isApproved ? 'aprobado' : 'rechazado';

        // Crear registro de pago
        const payment = await Payment.create({
            orderId,
            amount: order.total,
            method,
            status,
            transactionId: `TXN-${uuidv4().substring(0, 12).toUpperCase()}`,
        });

        // Si se aprueba, actualizar estado de la orden a 'procesando'
        if (isApproved) {
            await order.update({ status: 'procesando' });
        }

        // Notificar al usuario el resultado del pago
        if (io) {
            if (isApproved) {
                emitNotification(io, `user_${userId}`, 'payment_result',
                    '¡Pago aprobado!',
                    `Tu pago de $${order.total} fue aprobado. Tu pedido está en proceso.`,
                    { orderId, status: 'aprobado', transactionId: payment.transactionId }
                );
            } else {
                emitNotification(io, `user_${userId}`, 'payment_result',
                    'Pago rechazado',
                    `Tu pago de $${order.total} fue rechazado. Intenta nuevamente.`,
                    { orderId, status: 'rechazado' }
                );
            }

            // Notificar al admin
            emitNotification(io, 'admin_channel', 'payment_admin',
                `Pago ${isApproved ? 'aprobado' : 'rechazado'}`,
                `Pedido #${orderId} — $${order.total} — ${method} — ${isApproved ? 'APROBADO' : 'RECHAZADO'}.`,
                { orderId, status, method, amount: order.total }
            );
        }

        return {
            payment,
            order: await order.reload(),
            message: isApproved
                ? 'Pago procesado exitosamente'
                : 'El pago fue rechazado. Intente nuevamente.',
        };
    }

    async getByOrderId(orderId, userId = null) {
        const where = { orderId };

        // Si es un usuario normal, verificar que la orden le pertenece
        if (userId) {
            const order = await Order.findOne({ where: { id: orderId, userId } });
            if (!order) {
                const error = new Error('Orden no encontrada');
                error.statusCode = 404;
                throw error;
            }
        }

        const payments = await Payment.findAll({
            where,
            include: [{
                model: Order,
                as: 'order',
                attributes: ['id', 'total', 'status'],
            }],
            order: [['createdAt', 'DESC']],
        });

        return payments;
    }

    simulateDelay() {
        const delay = Math.floor(Math.random() * 1200) + 300;
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
}

module.exports = new PaymentService();
