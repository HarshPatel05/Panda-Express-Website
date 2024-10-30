// setup 
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();

// Create express app
const app = express();

// Allow use on different ports 
const cors = require('cors');
app.use(cors());

// Create pool
const pool = new Pool({
user: process.env.PSQL_USER,
host: process.env.PSQL_HOST,
database: process.env.PSQL_DATABASE,
password: process.env.PSQL_PASSWORD,
port: process.env.PSQL_PORT,
ssl: {rejectUnauthorized: false}
})


pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Database connection error:', err.stack));


// API Request to get list of employees
app.get('/api/employees', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM employees');  
      res.json(result.rows); 
    } catch (err) {
      console.error('Error fetching employees:', err.stack);
      res.status(500).send('Server error');
    }
  });


// API Request to get list of order history 
app.get('/api/orderhistory', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM orderhistory');  
      res.json(result.rows); 
    } catch (err) {
      console.error('Error fetching orderhistory:', err.stack);
      res.status(500).send('Server error');
    }
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});