require('dotenv').config();

const sequelize = require('../src/config/database');

const columnExists = async (queryInterface, tableName, columnName) => {
    const description = await queryInterface.describeTable(tableName);
    return !!description[columnName];
};

const migrate = async () => {
    const queryInterface = sequelize.getQueryInterface();

    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        if (!(await columnExists(queryInterface, 'products', 'brand'))) {
            await queryInterface.addColumn('products', 'brand', {
                type: sequelize.Sequelize.STRING,
                allowNull: true,
            });
            console.log('✅ Columna products.brand creada');
        } else {
            console.log('ℹ️ products.brand ya existe');
        }

        if (!(await columnExists(queryInterface, 'products', 'color'))) {
            await queryInterface.addColumn('products', 'color', {
                type: sequelize.Sequelize.STRING,
                allowNull: true,
            });
            console.log('✅ Columna products.color creada');
        } else {
            console.log('ℹ️ products.color ya existe');
        }

        await sequelize.query(
            `UPDATE products
             SET brand = COALESCE(NULLIF(brand, ''), 'Generica'),
                 color = COALESCE(NULLIF(color, ''), 'Negro')
             WHERE brand IS NULL OR brand = '' OR color IS NULL OR color = ''`,
        );
        console.log('✅ Backfill inicial de marca y color aplicado');

        console.log('\n🎉 Migración de brand/color completada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en migración brand/color:', error);
        process.exit(1);
    }
};

migrate();
