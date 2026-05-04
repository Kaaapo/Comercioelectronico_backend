require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { sequelize } = require('./models');
const { setupOrderSocket } = require('./sockets/orderSocket');

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Orígenes permitidos (los mismos que usa Express CORS)
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4200'];

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO con CORS restringido
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Guardar referencia de io en la app para usarlo en controllers
app.set('io', io);

// Configurar WebSocket para seguimiento de pedidos
setupOrderSocket(io);

// Conectar a la base de datos y arrancar el servidor
const start = async () => {
    try {
        await sequelize.authenticate();
        console.log(' Conexión a PostgreSQL establecida correctamente');

        if (isProduction) {
            console.log(' Producción detectada: sync automático deshabilitado (usar migraciones)');
        } else {
            // Solo en desarrollo para iterar rápidamente sobre el esquema.
            await sequelize.sync({ alter: true });
            console.log(' Modelos sincronizados con la base de datos');
        }

        server.listen(PORT, () => {
            console.log(`\n Servidor corriendo en http://localhost:${PORT}`);
            console.log(` Documentación API: http://localhost:${PORT}/api/docs`);
            console.log(` WebSocket: ws://localhost:${PORT}`);
            console.log(` Entorno: ${process.env.NODE_ENV || 'development'}\n`);
        });
    } catch (error) {
        console.error(' Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Graceful shutdown: cerrar conexiones limpiamente al reiniciar/detener
const shutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando servidor...`);
    server.close(() => {
        console.log('HTTP server cerrado');
    });
    try {
        await sequelize.close();
        console.log('Conexión a PostgreSQL cerrada');
    } catch (err) {
        console.error('Error cerrando DB:', err.message);
    }
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
