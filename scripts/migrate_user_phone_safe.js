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

        if (!(await columnExists(queryInterface, 'users', 'phone'))) {
            await queryInterface.addColumn('users', 'phone', {
                type: sequelize.Sequelize.STRING(20),
                allowNull: true,
            });
            console.log('✅ Columna users.phone creada');
        } else {
            console.log('ℹ️ users.phone ya existe');
        }

        console.log('\n🎉 Migración users.phone completada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en migración users.phone:', error);
        process.exit(1);
    }
};

migrate();
