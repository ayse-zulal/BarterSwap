const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    password: 'diana1343',
    host: 'localhost',
    port: 5432,
    database: 'barterswap'
});

module.exports = pool;