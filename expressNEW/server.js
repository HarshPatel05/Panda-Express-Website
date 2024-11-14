// npm install open
// node server.js


/**
 * STEPS TO RUN THE WEBSITE LOCALLY:
 * 
 * STEP 1: Open Docker on your laptop/desktop
 * STEP 2: Go into the New express folder ` cd expressNEW `
 * STEP 3: Then type, ` docker build -t ourapp . `
 * STEP 4: Then type, ` docker run -p 5000:5000 ourapp `
 * END: ` Ctrl+C `
 * 
*/

const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

// Set up view engine and middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT,
  ssl: process.env.PSQL_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Routes to render pages
app.get('/', (req, res) => {
  res.render('index'); // Render the views/index.ejs file
});

app.get('/index', (req, res) => {
  res.render('index'); // Render the views/index.ejs file
});

app.get('/menuBoard', (req, res) => {
  res.render('menuBoard'); // Render the views/menuBoard.ejs file
});

// Render the employees page with data from the database
app.get('/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees;');
    res.json(result.rows);
    // res.render('employees', { employees: result.rows });
  } catch (err) {
    console.error('Error fetching employees:', err.stack);
    res.status(500).send('Server Error');
  }
});



//endpoint to get x report 
app.get('/api/xreport', async (req, res) =>
  {
    const date = req.body; // Expecting date in 'YYYY-MM-DD' format
  
    const client = await pool.connect();
  
    try {
      const result = await client.query(
        'SELECT EXTRACT(HOUR FROM date) AS hour, SUM(totalcost) AS total_sum FROM orderhistory WHERE date >= $1 AND date < $2 GROUP BY hour ORDER BY hour ',
        ['${date} 10:00', '${date} 22:00']
      );
  
    res.json(result.rows);
    }
    catch (error) {
      console.error("Error fetching x report:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      client.release();
    }
  }
  );

// API Endpoint to get all menu items
app.get('/api/menuitems', async (req, res) => {
  try {
    const result = await pool.query('SELECT menuItemId, menuItem, price, size, displayName FROM menuItems');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu items:', error.stack);
    res.status(500).json({ error: 'Server Error' });
  }
});


// File Download Endpoint
const downloadFolder = path.join(__dirname, 'public', 'JSON Files');

if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder, { recursive: true });
}

const tailorMenuData = (data) => {
  return data.map(item => ({
    menuitem: item.menuitem,
    size: item.size,
    price: item.price,
  }));
};

app.get('/download-menu', async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${port}/api/menuitems`);
    const tailoredData = tailorMenuData(response.data);

    if (!tailoredData) {
      return res.status(500).send('Error formatting the menu data');
    }

    const filePath = path.join(downloadFolder, 'menuitems.json');
    fs.writeFileSync(filePath, JSON.stringify(tailoredData, null, 2));

    res.status(200).json({
      message: 'File has been successfully updated and saved.',
      filePath: filePath,
    });
  } catch (error) {
    console.error('Error downloading the file:', error);
    res.status(500).send('Failed to process the file');
  }
});

// Start the server
app.listen(port, '0.0.0.0', async () => {
  console.log(`Server is running on port ${port}`);
});
