const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { xss } = require('express-xss-sanitizer');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Rutas
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reviewRoutes = require('./routes/review.routes');
const returnRoutes = require('./routes/return.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const chatbotRoutes = require('./routes/chatbot.routes');

// Middleware
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// En plataformas con reverse proxy (Railway, Render, etc.), confiar en el primer proxy
// evita falsos errores de express-rate-limit con X-Forwarded-For.
if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
} else if (isProduction) {
    app.set('trust proxy', 1);
}

// ===================== MIDDLEWARE GLOBAL =====================
// Seguridad: headers HTTP seguros
app.use(helmet());

// Seguridad: CORS restringido según entorno
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4200'];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origin (Postman, curl, swagger local)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS: Origen no permitido'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Seguridad: limitar tamaño del body (evitar payload bombing)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Seguridad: sanitizar inputs contra XSS
app.use(xss());

// Seguridad: evitar HTTP Parameter Pollution
app.use(hpp());

// Rate limiting general: 500 requests por IP cada 15 minutos
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, message: 'Demasiadas solicitudes, intenta de nuevo en 15 minutos' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting estricto para auth: 10 intentos por IP cada 15 minutos
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Logging HTTP
app.use(morgan(isProduction ? 'short' : 'dev'));

// ===================== SWAGGER =====================
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Comercio Electrónico',
            version: '1.0.0',
            description: 'API REST para plataforma de comercio electrónico - Proyecto Universitario',
            contact: {
                name: 'Estudiante',
            },
        },
        servers: [
            {
                url: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
                description: isProduction ? 'Servidor de producción' : 'Servidor de desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
const swaggerDocsGuard = (req, res, next) => {
    // Permitir assets estáticos (CSS, JS, imágenes) pero verificar la clave en la página principal
    if (req.path === '/' || req.path === '') {
        if (req.query.key !== process.env.DOCS_API_KEY) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
    }
    next();
};
app.use('/api/docs', swaggerDocsGuard, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API E-Commerce - Docs',
}));

// ===================== RUTAS =====================
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: '🛒 API de Comercio Electrónico - Bienvenido',
        version: '1.0.0',
        docs: '/api/docs',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            categories: '/api/categories',
            cart: '/api/cart',
            orders: '/api/orders',
            payments: '/api/payments',
            dashboard: '/api/dashboard',
            reviews: '/api/reviews',
            returns: '/api/returns',
            wishlist: '/api/wishlist',
            chatbot: '/api/chatbot',
        },
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chatbot', chatbotRoutes);

// ===================== 404 =====================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
});

// ===================== ERROR HANDLER =====================
app.use(errorHandler);

module.exports = app;
