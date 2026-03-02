require('dotenv').config();

const { sequelize, User, Category, Product, Cart, Order, OrderItem, Payment } = require('../src/models');

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        // Sincronizar y limpiar tablas
        await sequelize.sync({ force: true });
        console.log('🗑️  Tablas recreadas');

        // ==================== USUARIOS ====================
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@ecommerce.com',
            password: 'admin123',
            role: 'admin',
            emailVerified: true,
        });

        const customer1 = await User.create({
            name: 'Carlos Martínez',
            email: 'carlos@email.com',
            password: 'password123',
            role: 'customer',
            emailVerified: true,
        });

        const customer2 = await User.create({
            name: 'María López',
            email: 'maria@email.com',
            password: 'password123',
            role: 'customer',
            emailVerified: true,
        });

        console.log('👥 Usuarios creados');

        // Crear carritos para los usuarios
        await Cart.create({ userId: admin.id });
        await Cart.create({ userId: customer1.id });
        await Cart.create({ userId: customer2.id });
        console.log('🛒 Carritos creados');

        // ==================== CATEGORÍAS ====================
        const categories = await Category.bulkCreate([
            { name: 'Electrónica', description: 'Dispositivos electrónicos y gadgets' },
            { name: 'Ropa', description: 'Ropa y accesorios de moda' },
            { name: 'Hogar', description: 'Artículos para el hogar y decoración' },
            { name: 'Deportes', description: 'Equipo y ropa deportiva' },
            { name: 'Libros', description: 'Libros físicos y digitales' },
        ]);
        console.log('📂 Categorías creadas');

        // ==================== PRODUCTOS ====================
        const products = await Product.bulkCreate([
            // Electrónica
            { name: 'Smartphone XPro 15', description: 'Teléfono inteligente de última generación con cámara de 108MP', price: 899.99, stock: 50, categoryId: categories[0].id, imageUrl: 'https://via.placeholder.com/400x400?text=Smartphone' },
            { name: 'Laptop UltraBook 14"', description: 'Laptop ultradelgada con procesador i7 y 16GB RAM', price: 1299.99, stock: 30, categoryId: categories[0].id, imageUrl: 'https://via.placeholder.com/400x400?text=Laptop' },
            { name: 'Auriculares Bluetooth Pro', description: 'Auriculares inalámbricos con cancelación de ruido activa', price: 149.99, stock: 100, categoryId: categories[0].id, imageUrl: 'https://via.placeholder.com/400x400?text=Auriculares' },
            { name: 'Tablet 10"', description: 'Tablet con pantalla retina y 128GB de almacenamiento', price: 449.99, stock: 40, categoryId: categories[0].id, imageUrl: 'https://via.placeholder.com/400x400?text=Tablet' },
            // Ropa
            { name: 'Camiseta Premium Algodón', description: 'Camiseta de algodón orgánico 100%, varios colores', price: 29.99, stock: 200, categoryId: categories[1].id, imageUrl: 'https://via.placeholder.com/400x400?text=Camiseta' },
            { name: 'Jeans Clásico', description: 'Jeans de corte recto con lavado clásico', price: 59.99, stock: 150, categoryId: categories[1].id, imageUrl: 'https://via.placeholder.com/400x400?text=Jeans' },
            { name: 'Zapatillas Running', description: 'Zapatillas deportivas con amortiguación avanzada', price: 89.99, stock: 80, categoryId: categories[1].id, imageUrl: 'https://via.placeholder.com/400x400?text=Zapatillas' },
            // Hogar
            { name: 'Lámpara LED Inteligente', description: 'Lámpara WiFi compatible con Alexa y Google Home', price: 39.99, stock: 120, categoryId: categories[2].id, imageUrl: 'https://via.placeholder.com/400x400?text=Lampara' },
            { name: 'Juego de Sábanas Queen', description: 'Sábanas de microfibra hipoalergénica 1800TC', price: 49.99, stock: 60, categoryId: categories[2].id, imageUrl: 'https://via.placeholder.com/400x400?text=Sabanas' },
            // Deportes
            { name: 'Mancuernas Ajustables 20kg', description: 'Par de mancuernas ajustables de 2 a 20kg', price: 129.99, stock: 45, categoryId: categories[3].id, imageUrl: 'https://via.placeholder.com/400x400?text=Mancuernas' },
            { name: 'Esterilla Yoga Premium', description: 'Esterilla antideslizante de 6mm de grosor', price: 34.99, stock: 90, categoryId: categories[3].id, imageUrl: 'https://via.placeholder.com/400x400?text=Esterilla' },
            // Libros
            { name: 'Clean Code', description: 'Robert C. Martin - A Handbook of Agile Software Craftsmanship', price: 39.99, stock: 70, categoryId: categories[4].id, imageUrl: 'https://via.placeholder.com/400x400?text=CleanCode' },
            { name: 'Design Patterns', description: 'Gang of Four - Elements of Reusable Object-Oriented Software', price: 44.99, stock: 55, categoryId: categories[4].id, imageUrl: 'https://via.placeholder.com/400x400?text=DesignPatterns' },
            { name: 'Producto Agotado Test', description: 'Producto de prueba sin stock', price: 9.99, stock: 0, categoryId: categories[4].id, imageUrl: 'https://via.placeholder.com/400x400?text=SinStock' },
            { name: 'Producto Stock Bajo', description: 'Producto con stock bajo para pruebas de dashboard', price: 19.99, stock: 3, categoryId: categories[2].id, imageUrl: 'https://via.placeholder.com/400x400?text=StockBajo' },
        ]);
        console.log('📦 Productos creados');

        // ==================== ÓRDENES DE EJEMPLO ====================
        const order1 = await Order.create({
            userId: customer1.id,
            orderNumber: 'PED-000001-SEED01',
            total: 979.98,
            status: 'entregado',
            shippingAddress: 'Av. Principal 456, Bogotá, Colombia',
        });

        await OrderItem.bulkCreate([
            { orderId: order1.id, productId: products[0].id, quantity: 1, unitPrice: 899.99 },
            { orderId: order1.id, productId: products[4].id, quantity: 2, unitPrice: 29.99 },
        ]);

        await Payment.create({
            orderId: order1.id,
            amount: 979.98,
            method: 'tarjeta',
            status: 'aprobado',
            transactionId: 'TXN-SEED-001',
        });

        const order2 = await Order.create({
            userId: customer1.id,
            orderNumber: 'PED-000002-SEED02',
            total: 1349.98,
            status: 'enviado',
            shippingAddress: 'Calle 72 #10-50, Bogotá, Colombia',
        });

        await OrderItem.bulkCreate([
            { orderId: order2.id, productId: products[1].id, quantity: 1, unitPrice: 1299.99 },
            { orderId: order2.id, productId: products[7].id, quantity: 1, unitPrice: 39.99 },
        ]);

        await Payment.create({
            orderId: order2.id,
            amount: 1349.98,
            method: 'paypal',
            status: 'aprobado',
            transactionId: 'TXN-SEED-002',
        });

        const order3 = await Order.create({
            userId: customer2.id,
            orderNumber: 'PED-000003-SEED03',
            total: 239.97,
            status: 'procesando',
            shippingAddress: 'Carrera 15 #88-12, Medellín, Colombia',
        });

        await OrderItem.bulkCreate([
            { orderId: order3.id, productId: products[5].id, quantity: 1, unitPrice: 59.99 },
            { orderId: order3.id, productId: products[6].id, quantity: 2, unitPrice: 89.99 },
        ]);

        await Payment.create({
            orderId: order3.id,
            amount: 239.97,
            method: 'transferencia',
            status: 'aprobado',
            transactionId: 'TXN-SEED-003',
        });

        console.log('📋 Órdenes de ejemplo creadas');

        console.log('\n============================================');
        console.log('✅ SEED COMPLETADO EXITOSAMENTE');
        console.log('============================================');
        console.log('\n📌 Credenciales de prueba:');
        console.log('   Admin:    admin@ecommerce.com / admin123');
        console.log('   Cliente1: carlos@email.com / password123');
        console.log('   Cliente2: maria@email.com / password123');
        console.log('============================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en el seed:', error);
        process.exit(1);
    }
};

seed();
