const Sequelize = require('sequelize')

const sequelize = new Sequelize('my_db', 'root', 'Clara051016', {
    host: 'database-1.cvmpekr00lwq.sa-east-1.rds.amazonaws.com',
    dialect: 'mysql',
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
        timestamps: true
    },
    logging: false
});

// TESTANDO A CONEXÃO
sequelize.authenticate().then(() => {
    console.log('Conectado com sucesso!');
}).catch((erro) => {
    console.log('Falha' + erro);
});

module.exports = { Sequelize, sequelize }