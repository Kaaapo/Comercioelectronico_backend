require('dotenv').config();

const { Op } = require('sequelize');
const { sequelize, Category, Product, ProductImage } = require('../src/models');

const gamerCategories = [
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
];

const gamerProducts = [
    {
        name: 'Mouse Gamer Logitech G502 X',
        description: 'Mouse gamer con sensor de alta precisión y switches híbridos óptico-mecánicos.',
        price: 89.99,
        stock: 75,
        featured: true,
        brand: 'Logitech',
        color: 'Negro',
        imageUrl: 'https://via.placeholder.com/800x800?text=Mouse+G502X',
        category: 'Ratones Gamer',
    },
    {
        name: 'Mouse Gamer Razer DeathAdder V3',
        description: 'Mouse ergonómico gamer ultraligero con polling rate avanzado.',
        price: 99.99,
        stock: 60,
        featured: true,
        brand: 'Razer',
        color: 'Negro',
        imageUrl: 'https://via.placeholder.com/800x800?text=DeathAdder+V3',
        category: 'Ratones Gamer',
    },
    {
        name: 'Teclado Mecánico HyperX Alloy Origins',
        description: 'Teclado mecánico compacto con iluminación RGB y switches lineales.',
        price: 129.99,
        stock: 40,
        featured: true,
        brand: 'HyperX',
        color: 'Negro',
        imageUrl: 'https://via.placeholder.com/800x800?text=HyperX+Alloy',
        category: 'Teclados Gamer',
    },
    {
        name: 'Teclado Mecánico Redragon K552',
        description: 'Teclado mecánico 60% ideal para gaming competitivo.',
        price: 59.99,
        stock: 90,
        featured: false,
        brand: 'Redragon',
        color: 'Blanco',
        imageUrl: 'https://via.placeholder.com/800x800?text=Redragon+K552',
        category: 'Teclados Gamer',
    },
    {
        name: 'Auriculares Inalámbricos Logitech G733',
        description: 'Auriculares inalámbricos con sonido envolvente y micrófono desmontable.',
        price: 159.99,
        stock: 35,
        featured: true,
        brand: 'Logitech',
        color: 'Azul',
        imageUrl: 'https://via.placeholder.com/800x800?text=Logitech+G733',
        category: 'Auriculares Gamer',
    },
    {
        name: 'Auriculares HyperX Cloud II',
        description: 'Auriculares con sonido 7.1 virtual y gran aislamiento de ruido.',
        price: 99.99,
        stock: 50,
        featured: false,
        brand: 'HyperX',
        color: 'Rojo',
        imageUrl: 'https://via.placeholder.com/800x800?text=HyperX+Cloud+II',
        category: 'Auriculares Gamer',
    },
    {
        name: 'Mousepad XL SteelSeries QcK',
        description: 'Mousepad de gran formato optimizado para control y velocidad.',
        price: 29.99,
        stock: 120,
        featured: false,
        brand: 'SteelSeries',
        color: 'Negro',
        imageUrl: 'https://via.placeholder.com/800x800?text=SteelSeries+QcK',
        category: 'Mousepads',
    },
    {
        name: 'Monitor Gamer Samsung Odyssey G5',
        description: 'Monitor curvo QHD con 144Hz y 1ms de respuesta.',
        price: 349.99,
        stock: 28,
        featured: true,
        brand: 'Samsung',
        color: 'Negro',
        imageUrl: 'https://via.placeholder.com/800x800?text=Odyssey+G5',
        category: 'Monitores Gamer',
    },
    {
        name: 'Celular Samsung Galaxy S24',
        description: 'Smartphone de alto rendimiento con pantalla AMOLED y cámara avanzada.',
        price: 899.99,
        stock: 45,
        featured: true,
        brand: 'Samsung',
        color: 'Gris',
        imageUrl: 'https://via.placeholder.com/800x800?text=Galaxy+S24',
        category: 'Celulares',
    },
    {
        name: 'Celular Xiaomi 14T Pro',
        description: 'Celular potente para gaming móvil con carga rápida.',
        price: 749.99,
        stock: 38,
        featured: false,
        brand: 'Xiaomi',
        color: 'Negro',
        imageUrl: 'https://via.placeholder.com/800x800?text=Xiaomi+14T+Pro',
        category: 'Celulares',
    },
];

const seedGamerCatalog = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        const categoryMap = {};
        for (const cat of gamerCategories) {
            const [category] = await Category.findOrCreate({
                where: { name: cat.name },
                defaults: cat,
            });
            await category.update({ description: cat.description, imageUrl: cat.imageUrl });
            categoryMap[cat.name] = category;
        }
        console.log('✅ Categorías gamer aseguradas');

        const targetNames = gamerProducts.map((product) => product.name);
        await Product.update(
            { active: false, featured: false },
            { where: { name: { [Op.notIn]: targetNames } } },
        );

        for (const item of gamerProducts) {
            const category = categoryMap[item.category];
            const payload = {
                name: item.name,
                description: item.description,
                price: item.price,
                stock: item.stock,
                featured: item.featured,
                brand: item.brand,
                color: item.color,
                imageUrl: item.imageUrl,
                categoryId: category.id,
                active: true,
            };

            const existing = await Product.findOne({ where: { name: item.name } });
            let product;
            if (existing) {
                await existing.update(payload);
                product = existing;
            } else {
                product = await Product.create(payload);
            }

            const [primaryImage] = await ProductImage.findOrCreate({
                where: {
                    productId: product.id,
                    isPrimary: true,
                },
                defaults: {
                    productId: product.id,
                    imageUrl: item.imageUrl,
                    sortOrder: 0,
                    isPrimary: true,
                },
            });
            await primaryImage.update({ imageUrl: item.imageUrl, sortOrder: 0 });

            const secondaryUrl = `${item.imageUrl}+Extra`;
            const [secondaryImage] = await ProductImage.findOrCreate({
                where: {
                    productId: product.id,
                    sortOrder: 1,
                },
                defaults: {
                    productId: product.id,
                    imageUrl: secondaryUrl,
                    sortOrder: 1,
                    isPrimary: false,
                },
            });
            await secondaryImage.update({ imageUrl: secondaryUrl, isPrimary: false });
        }
        console.log('✅ Productos gamer/electrónicos sincronizados');

        const fallbackCategory = categoryMap['Accesorios Gamer'];
        const legacyCategories = await Category.findAll({
            where: { name: { [Op.notIn]: gamerCategories.map((cat) => cat.name) } },
        });

        if (legacyCategories.length > 0) {
            const legacyCategoryIds = legacyCategories.map((cat) => cat.id);
            await Product.update(
                {
                    categoryId: fallbackCategory.id,
                    active: false,
                    featured: false,
                },
                {
                    where: {
                        categoryId: { [Op.in]: legacyCategoryIds },
                    },
                },
            );
            await Category.destroy({ where: { id: { [Op.in]: legacyCategoryIds } } });
            console.log('✅ Categorías no gamer removidas y productos legacy desactivados');
        } else {
            console.log('ℹ️ No hay categorías legacy para remover');
        }

        console.log('\n🎉 Catálogo gamer incremental completado');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en seed gamer incremental:', error);
        process.exit(1);
    }
};

seedGamerCatalog();
