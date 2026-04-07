require('dotenv').config();

const sequelize = require('../src/config/database');

const seedFeatureData = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        // 1) Marcar productos como destacados si aún no existen destacados
        const [featuredCountRows] = await sequelize.query('SELECT COUNT(*)::int AS count FROM products WHERE featured = true');
        const featuredCount = featuredCountRows[0]?.count || 0;

        if (featuredCount === 0) {
            await sequelize.query(
                `UPDATE products
                 SET featured = true
                 WHERE id IN (
                     SELECT id FROM products WHERE active = true ORDER BY "createdAt" DESC LIMIT 8
                 )`,
            );
            console.log('✅ Productos destacados iniciales asignados');
        } else {
            console.log('ℹ️ Ya existen productos destacados, no se modificaron');
        }

        // 2) Crear imágenes secundarias de ejemplo para productos que solo tienen una imagen
        await sequelize.query(
            `INSERT INTO product_images (product_id, image_url, sort_order, is_primary, "createdAt", "updatedAt")
             SELECT p.id,
                    'https://via.placeholder.com/800x800?text=Producto+' || p.id || '+Extra',
                    1,
                    false,
                    NOW(),
                    NOW()
             FROM products p
             WHERE EXISTS (
                 SELECT 1 FROM product_images pi0 WHERE pi0.product_id = p.id
             )
             AND NOT EXISTS (
                 SELECT 1 FROM product_images pi1 WHERE pi1.product_id = p.id AND pi1.sort_order = 1
             )
             LIMIT 200`,
        );
        console.log('✅ Imágenes secundarias de ejemplo creadas donde faltaban');

        // 3) Crear favoritos de ejemplo para usuarios customer (sin duplicados)
        await sequelize.query(
            `INSERT INTO wishlists (user_id, product_id, "createdAt", "updatedAt")
             SELECT u.id, p.id, NOW(), NOW()
             FROM users u
             CROSS JOIN LATERAL (
                 SELECT id FROM products WHERE active = true ORDER BY featured DESC, "createdAt" DESC LIMIT 3
             ) p
             WHERE u.role = 'customer'
             ON CONFLICT (user_id, product_id) DO NOTHING`,
        );
        console.log('✅ Favoritos de ejemplo creados para customers (sin duplicados)');

        console.log('\n🎉 Seed incremental completado (sin borrar datos)');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en seed incremental:', error);
        process.exit(1);
    }
};

seedFeatureData();
