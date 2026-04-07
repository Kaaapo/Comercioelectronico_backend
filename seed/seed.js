require('dotenv').config();

const {
    sequelize,
    User,
    Category,
    Product,
    ProductImage,
    Wishlist,
    Cart,
    Order,
    OrderItem,
    Payment,
} = require('../src/models');

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        // Sincronizar y limpiar tablas
        await sequelize.sync({ force: true });
        console.log('🗑️  Tablas recreadas');

        // ==================== USUARIOS ====================
        const admin = await User.create({
            name: 'Administrador Principal',
            identificationNumber: '1003828562',
            birthDate: '2002-11-28',
            address: 'Calle 1 #1-01',
            city: 'Neiva',
            department: 'Huila',
            email: 'davidcito01012002@gmail.com',
            password: '409KL00c.',
            role: 'admin',
            emailVerified: true,
        });

        const customer1 = await User.create({
            name: 'Carlos Martínez',
            identificationNumber: '1000000002',
            birthDate: '1995-06-20',
            address: 'Carrera 10 #20-30',
            city: 'Medellín',
            department: 'Antioquia',
            email: 'carlos@email.com',
            password: 'password123',
            role: 'customer',
            emailVerified: true,
        });

        const customer2 = await User.create({
            name: 'María López',
            identificationNumber: '1000000003',
            birthDate: '1998-03-10',
            address: 'Avenida 5 #15-25',
            city: 'Cali',
            department: 'Valle del Cauca',
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
            {
                name: 'Ratones Gamer',
                description: 'Ratones, mouse y periféricos de precisión para gaming',
                imageUrl: 'https://via.placeholder.com/400x400?text=Ratones+Gamer',
            },
            {
                name: 'Teclados Gamer',
                description: 'Teclados mecánicos, compactos y full-size para gaming',
                imageUrl: 'https://via.placeholder.com/400x400?text=Teclados+Gamer',
            },
            {
                name: 'Auriculares Gamer',
                description: 'Auriculares alámbricos e inalámbricos para juego competitivo',
                imageUrl: 'https://via.placeholder.com/400x400?text=Auriculares+Gamer',
            },
            {
                name: 'Mousepads',
                description: 'Superficies de control para ratón en distintos tamaños y texturas',
                imageUrl: 'https://via.placeholder.com/400x400?text=Mousepads',
            },
            {
                name: 'Monitores Gamer',
                description: 'Monitores de alta tasa de refresco y baja latencia',
                imageUrl: 'https://via.placeholder.com/400x400?text=Monitores+Gamer',
            },
            {
                name: 'Celulares',
                description: 'Smartphones y accesorios de alto rendimiento',
                imageUrl: 'https://via.placeholder.com/400x400?text=Celulares',
            },
            {
                name: 'Accesorios Gamer',
                description: 'Accesorios complementarios para setups gamers',
                imageUrl: 'https://via.placeholder.com/400x400?text=Accesorios+Gamer',
            },
        ]);
        console.log('📂 Categorías creadas');

        // ==================== PRODUCTOS ====================
        const products = await Product.bulkCreate([
            { name: 'Mouse Gamer Logitech G502 X', description: 'Mouse gamer con sensor de alta precisión y switches híbridos óptico-mecánicos.', brand: 'Logitech', color: 'Negro', price: 89.99, stock: 75, categoryId: categories[0].id, imageUrl: 'https://via.placeholder.com/800x800?text=Mouse+G502X', featured: true },
            { name: 'Mouse Gamer Razer DeathAdder V3', description: 'Mouse ergonómico gamer ultraligero con polling rate avanzado.', brand: 'Razer', color: 'Negro', price: 99.99, stock: 60, categoryId: categories[0].id, imageUrl: 'https://via.placeholder.com/800x800?text=DeathAdder+V3', featured: true },
            { name: 'Teclado Mecánico HyperX Alloy Origins', description: 'Teclado mecánico compacto con iluminación RGB y switches lineales.', brand: 'HyperX', color: 'Negro', price: 129.99, stock: 40, categoryId: categories[1].id, imageUrl: 'https://via.placeholder.com/800x800?text=HyperX+Alloy', featured: true },
            { name: 'Teclado Mecánico Redragon K552', description: 'Teclado mecánico 60% ideal para gaming competitivo.', brand: 'Redragon', color: 'Blanco', price: 59.99, stock: 90, categoryId: categories[1].id, imageUrl: 'https://via.placeholder.com/800x800?text=Redragon+K552', featured: false },
            { name: 'Auriculares Inalámbricos Logitech G733', description: 'Auriculares inalámbricos con sonido envolvente y micrófono desmontable.', brand: 'Logitech', color: 'Azul', price: 159.99, stock: 35, categoryId: categories[2].id, imageUrl: 'https://via.placeholder.com/800x800?text=Logitech+G733', featured: true },
            { name: 'Auriculares HyperX Cloud II', description: 'Auriculares con sonido 7.1 virtual y gran aislamiento de ruido.', brand: 'HyperX', color: 'Rojo', price: 99.99, stock: 50, categoryId: categories[2].id, imageUrl: 'https://via.placeholder.com/800x800?text=HyperX+Cloud+II', featured: false },
            { name: 'Mousepad XL SteelSeries QcK', description: 'Mousepad de gran formato optimizado para control y velocidad.', brand: 'SteelSeries', color: 'Negro', price: 29.99, stock: 120, categoryId: categories[3].id, imageUrl: 'https://via.placeholder.com/800x800?text=SteelSeries+QcK', featured: false },
            { name: 'Mousepad Razer Gigantus V2', description: 'Superficie texturizada con base antideslizante para gaming competitivo.', brand: 'Razer', color: 'Negro', price: 34.99, stock: 95, categoryId: categories[3].id, imageUrl: 'https://via.placeholder.com/800x800?text=Gigantus+V2', featured: false },
            { name: 'Monitor Gamer Samsung Odyssey G5', description: 'Monitor curvo QHD con 144Hz y 1ms de respuesta.', brand: 'Samsung', color: 'Negro', price: 349.99, stock: 28, categoryId: categories[4].id, imageUrl: 'https://via.placeholder.com/800x800?text=Odyssey+G5', featured: true },
            { name: 'Monitor Gamer ASUS TUF VG27AQ', description: 'Monitor IPS 165Hz con sincronización adaptativa.', brand: 'ASUS', color: 'Negro', price: 399.99, stock: 22, categoryId: categories[4].id, imageUrl: 'https://via.placeholder.com/800x800?text=ASUS+TUF+VG27AQ', featured: true },
            { name: 'Celular Samsung Galaxy S24', description: 'Smartphone de alto rendimiento con pantalla AMOLED y cámara avanzada.', brand: 'Samsung', color: 'Gris', price: 899.99, stock: 45, categoryId: categories[5].id, imageUrl: 'https://via.placeholder.com/800x800?text=Galaxy+S24', featured: true },
            { name: 'Celular Xiaomi 14T Pro', description: 'Celular potente para gaming móvil con carga rápida.', brand: 'Xiaomi', color: 'Negro', price: 749.99, stock: 38, categoryId: categories[5].id, imageUrl: 'https://via.placeholder.com/800x800?text=Xiaomi+14T+Pro', featured: false },
            { name: 'Micrófono USB HyperX SoloCast', description: 'Micrófono condensador USB para streaming y comunicación en partidas.', brand: 'HyperX', color: 'Negro', price: 69.99, stock: 55, categoryId: categories[6].id, imageUrl: 'https://via.placeholder.com/800x800?text=SoloCast', featured: false },
            { name: 'Webcam Logitech C922 Pro', description: 'Webcam Full HD ideal para streaming gamer.', brand: 'Logitech', color: 'Negro', price: 119.99, stock: 33, categoryId: categories[6].id, imageUrl: 'https://via.placeholder.com/800x800?text=Logitech+C922', featured: false },
            { name: 'Silla Gamer Cougar Armor One', description: 'Silla gamer ergonómica con soporte lumbar y reposabrazos ajustables.', brand: 'Cougar', color: 'Naranja', price: 239.99, stock: 14, categoryId: categories[6].id, imageUrl: 'https://via.placeholder.com/800x800?text=Cougar+Armor+One', featured: false },
        ]);
        console.log('📦 Productos creados');

        const productImageRows = products.flatMap((product, index) => [
            {
                productId: product.id,
                imageUrl: product.imageUrl,
                sortOrder: 0,
                isPrimary: true,
            },
            {
                productId: product.id,
                imageUrl: `https://via.placeholder.com/400x400?text=Producto+${index + 1}+A`,
                sortOrder: 1,
                isPrimary: false,
            },
            {
                productId: product.id,
                imageUrl: `https://via.placeholder.com/400x400?text=Producto+${index + 1}+B`,
                sortOrder: 2,
                isPrimary: false,
            },
        ]);

        await ProductImage.bulkCreate(productImageRows);
        console.log('🖼️ Imágenes de productos creadas');

        await Wishlist.bulkCreate([
            { userId: customer1.id, productId: products[0].id },
            { userId: customer1.id, productId: products[4].id },
            { userId: customer2.id, productId: products[1].id },
        ]);
        console.log('❤️ Favoritos creados');

        // ==================== ÓRDENES DE EJEMPLO ====================
        const order1 = await Order.create({
            userId: customer1.id,
            orderNumber: 'PED-000001-SEED01',
            total: 1219.97,
            status: 'entregado',
            shippingAddress: 'Av. Principal 456, Bogotá, Colombia',
        });

        await OrderItem.bulkCreate([
            { orderId: order1.id, productId: products[0].id, quantity: 1, unitPrice: 899.99 },
            { orderId: order1.id, productId: products[4].id, quantity: 2, unitPrice: 29.99 },
        ]);

        await Payment.create({
            orderId: order1.id,
            amount: 1219.97,
            method: 'tarjeta',
            status: 'aprobado',
            transactionId: 'TXN-SEED-001',
        });

        const order2 = await Order.create({
            userId: customer1.id,
            orderNumber: 'PED-000002-SEED02',
            total: 429.98,
            status: 'enviado',
            shippingAddress: 'Calle 72 #10-50, Bogotá, Colombia',
        });

        await OrderItem.bulkCreate([
            { orderId: order2.id, productId: products[8].id, quantity: 1, unitPrice: 349.99 },
            { orderId: order2.id, productId: products[6].id, quantity: 1, unitPrice: 29.99 },
        ]);

        await Payment.create({
            orderId: order2.id,
            amount: 429.98,
            method: 'paypal',
            status: 'aprobado',
            transactionId: 'TXN-SEED-002',
        });

        const order3 = await Order.create({
            userId: customer2.id,
            orderNumber: 'PED-000003-SEED03',
            total: 319.97,
            status: 'procesando',
            shippingAddress: 'Carrera 15 #88-12, Medellín, Colombia',
        });

        await OrderItem.bulkCreate([
            { orderId: order3.id, productId: products[5].id, quantity: 1, unitPrice: 99.99 },
            { orderId: order3.id, productId: products[6].id, quantity: 2, unitPrice: 29.99 },
            { orderId: order3.id, productId: products[13].id, quantity: 1, unitPrice: 119.99 },
        ]);

        await Payment.create({
            orderId: order3.id,
            amount: 319.97,
            method: 'transferencia',
            status: 'aprobado',
            transactionId: 'TXN-SEED-003',
        });

        console.log('📋 Órdenes de ejemplo creadas');

        console.log('\n============================================');
        console.log('✅ SEED COMPLETADO EXITOSAMENTE');
        console.log('============================================');
        console.log('\n📌 Credenciales de prueba:');
        console.log('   Admin:    davidcito01012002@gmail.com / 409KL00c.');
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
