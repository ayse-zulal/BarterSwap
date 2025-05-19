const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: '!Ab134340Ab!',
    host: 'localhost',
    port: 5432,
    database: 'barterswap'
});

module.exports = pool;