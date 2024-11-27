const { Pool } = require('pg');
require('dotenv').config();
const password = process.env.password
const host = process.env.host 
const user = process.env.user 
const db = process.env.db

const pool = new Pool({
  database: db,
  host:host,
  password:password,
  user: user,
  port: 5432
})

module.exports = pool