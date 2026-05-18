const { Payment, Order, User, OrderItem, Product } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { emitNotification } = require('../sockets/orderSocket');
const { sendOrderConfirmationEmail } = require('./email.service');

class PaymentService {
    /**
     * Simula el procesamiento de un pago.
     * Soporta reintentos: si ya existe un pago rechazado/pendiente para la orden,
     * lo actualiza en lugar de crear uno nuevo (evita el error de unique constraint).
     */
    async processPayment({ orderId, method }, userId, io) {
        const order = await Order.findOne({
            where: { id: orderId, userId },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                {
                    model: OrderItem, as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl'] }],
                },
            ],
        });

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

        // Verificar que no exista ya un pago aprobado
        const existingPayment = await Payment.findOne({ where: { orderId } });
        if (existingPayment && existingPayment.status === 'aprobado') {
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
        const newTransactionId = `TXN-${uuidv4().substring(0, 12).toUpperCase()}`;

        let payment;
        if (existingPayment) {
            // Reintento: actualizar el registro existente (no crear uno nuevo)
            payment = await existingPayment.update({
                method,
                status,
                transactionId: newTransactionId,
            });
        } else {
            payment = await Payment.create({
                orderId,
                amount: order.total,
                method,
                status,
                transactionId: newTransactionId,
            });
        }

        // Si se aprueba, actualizar estado de la orden a 'procesando'
        if (isApproved) {
            await order.update({ status: 'procesando' });

            // Enviar email de confirmación solo cuando el pago es aprobado
            sendOrderConfirmationEmail(
                order.user?.email,
                order.user?.name || 'Cliente',
                order,
                order.items || []
            ).catch(err => console.error('[Email] Error al enviar confirmación de pago:', err.message));
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
                : 'El pago fue rechazado. Intenta con otro método de pago.',
        };
    }

    async getByOrderId(orderId, userId = null) {
        const where = { orderId };

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
