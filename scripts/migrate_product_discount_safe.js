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

        // 1) products.discount_percentage
        if (!(await columnExists(queryInterface, 'products', 'discount_percentage'))) {
            await queryInterface.addColumn('products', 'discount_percentage', {
                type: sequelize.Sequelize.INTEGER,
                allowNull: true,
            });
            console.log('✅ Columna products.discount_percentage creada');
        } else {
            console.log('ℹ️  products.discount_percentage ya existe');
        }

        // 2) products.original_price
        if (!(await columnExists(queryInterface, 'products', 'original_price'))) {
            await queryInterface.addColumn('products', 'original_price', {
                type: sequelize.Sequelize.DECIMAL(10, 2),
                allowNull: true,
            });
            console.log('✅ Columna products.original_price creada');
        } else {
            console.log('ℹ️  products.original_price ya existe');
        }

        // 3) products.supplier
        if (!(await columnExists(queryInterface, 'products', 'supplier'))) {
            await queryInterface.addColumn('products', 'supplier', {
                type: sequelize.Sequelize.STRING,
                allowNull: true,
            });
            console.log('✅ Columna products.supplier creada');
        } else {
            console.log('ℹ️  products.supplier ya existe');
        }

        // 4) products.specifications
        if (!(await columnExists(queryInterface, 'products', 'specifications'))) {
            await queryInterface.addColumn('products', 'specifications', {
                type: sequelize.Sequelize.JSONB,
                allowNull: true,
            });
            console.log('✅ Columna products.specifications creada');
        } else {
            console.log('ℹ️  products.specifications ya existe');
        }

        console.log('\n🎉 Migración completada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando migración:', error);
        process.exit(1);
    }
};

migrate();
