const jwt = require('jsonwebtoken');

/**
 * Emite una notificación estructurada a una sala específica.
 *
 * Eventos disponibles que recibe el frontend:
 *  - "notification" → notificación general (pedidos, pagos) solamnte se necesita escuchar sto y  mostrar el msg por parte de front
 *
 * Tipos de notificación (campo `type`):
 *  - "order_created"          → usuario creó un pedido (canal: user_{id} y admin_channel)
 *  - "order_status_updated"   → admin cambió estado del pedido (canal: user_{id})
 *  - "payment_result"         → resultado del pago (canal: user_{id})
 *  - "new_order_admin"        → nuevo pedido recibido (canal: admin_channel)
 *  - "payment_admin"          → pago procesado (canal: admin_channel)
 */
const emitNotification = (io, room, type, title, message, data = {}) => {
    io.to(room).emit('notification', {
        type,
        title,
        message,
        data,
        timestamp: new Date(),
    });
};

/**
 * Configuración de Socket.IO para notificaciones en tiempo real
 */
const setupOrderSocket = (io) => {
    // Middleware de autenticación para WebSocket
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            return next(new Error('Token no proporcionado'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            return next(new Error('Token inválido'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Usuario conectado: ${socket.user.email} (${socket.user.role})`);

        // Canal personal del usuario
        socket.join(`user_${socket.user.id}`);

        // Canal exclusivo de administradores
        if (socket.user.role === 'admin') {
            socket.join('admin_channel');
        }

        // Ping para verificar conexión activa
        socket.on('ping', () => {
            socket.emit('pong', { message: 'Conexión activa', timestamp: new Date() });
        });

        socket.on('disconnect', () => {
            console.log(`❌ Usuario desconectado: ${socket.user.email}`);
        });
    });

    console.log('📡 Socket.IO configurado para notificaciones en tiempo real');
};

module.exports = { setupOrderSocket, emitNotification };
