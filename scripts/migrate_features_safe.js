require('dotenv').config();

const sequelize = require('../src/config/database');

const CATEGORY_IMAGE_FALLBACK = 'https://via.placeholder.com/400x400?text=Categoria';

const tableExists = async (queryInterface, tableName) => {
    try {
        await queryInterface.describeTable(tableName);
        return true;
    } catch (error) {
        return false;
    }
};

const columnExists = async (queryInterface, tableName, columnName) => {
    const description = await queryInterface.describeTable(tableName);
    return !!description[columnName];
};

const migrate = async () => {
    const queryInterface = sequelize.getQueryInterface();

    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        // 1) products.featured
        if (!(await columnExists(queryInterface, 'products', 'featured'))) {
            await queryInterface.addColumn('products', 'featured', {
                type: sequelize.Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
            console.log('✅ Columna products.featured creada');
        } else {
            console.log('ℹ️ products.featured ya existe');
        }

        // 2) categories.image_url (primero nullable para backfill, luego NOT NULL)
        if (!(await columnExists(queryInterface, 'categories', 'image_url'))) {
            await queryInterface.addColumn('categories', 'image_url', {
                type: sequelize.Sequelize.STRING,
                allowNull: true,
            });
            console.log('✅ Columna categories.image_url creada (nullable)');
        } else {
            console.log('ℹ️ categories.image_url ya existe');
        }

        await sequelize.query(
            `UPDATE categories
             SET image_url = COALESCE(NULLIF(image_url, ''), :fallback)
             WHERE image_url IS NULL OR image_url = ''`,
            { replacements: { fallback: CATEGORY_IMAGE_FALLBACK } },
        );
        await queryInterface.changeColumn('categories', 'image_url', {
            type: sequelize.Sequelize.STRING,
            allowNull: false,
        });
        console.log('✅ categories.image_url backfill + NOT NULL aplicado');

        // 3) Tabla product_images
        if (!(await tableExists(queryInterface, 'product_images'))) {
            await queryInterface.createTable('product_images', {
                id: {
                    type: sequelize.Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                product_id: {
                    type: sequelize.Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'products',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                image_url: {
                    type: sequelize.Sequelize.STRING,
                    allowNull: false,
                },
                sort_order: {
                    type: sequelize.Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                is_primary: {
                    type: sequelize.Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                createdAt: {
                    type: sequelize.Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('NOW()'),
                },
                updatedAt: {
                    type: sequelize.Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('NOW()'),
                },
            });
            console.log('✅ Tabla product_images creada');
        } else {
            console.log('ℹ️ product_images ya existe');
        }

        await sequelize.query(
            `INSERT INTO product_images (product_id, image_url, sort_order, is_primary, "createdAt", "updatedAt")
             SELECT p.id, p.image_url, 0, true, NOW(), NOW()
             FROM products p
             LEFT JOIN product_images pi
               ON pi.product_id = p.id AND pi.is_primary = true
             WHERE p.image_url IS NOT NULL
               AND p.image_url <> ''
               AND pi.id IS NULL`,
        );
        console.log('✅ Backfill inicial de product_images completado');

        // 4) Tabla wishlists
        if (!(await tableExists(queryInterface, 'wishlists'))) {
            await queryInterface.createTable('wishlists', {
                id: {
                    type: sequelize.Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                user_id: {
                    type: sequelize.Sequelize.UUID,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                product_id: {
                    type: sequelize.Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'products',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                createdAt: {
                    type: sequelize.Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('NOW()'),
                },
                updatedAt: {
                    type: sequelize.Sequelize.DATE,
                    allowNull: false,
                    defaultValue: sequelize.literal('NOW()'),
                },
            });
            console.log('✅ Tabla wishlists creada');
        } else {
            console.log('ℹ️ wishlists ya existe');
        }

        // Índices idempotentes
        await sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS wishlists_user_product_unique ON wishlists (user_id, product_id)');
        await sequelize.query('CREATE INDEX IF NOT EXISTS product_images_product_idx ON product_images (product_id)');
        await sequelize.query('CREATE INDEX IF NOT EXISTS product_images_primary_idx ON product_images (product_id, is_primary)');
        console.log('✅ Índices verificados/creados');

        console.log('\n🎉 Migración segura completada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando migración segura:', error);
        process.exit(1);
    }
};

migrate();
