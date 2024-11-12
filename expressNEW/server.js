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
  ssl: { rejectUnauthorized: false },
});

// Render the employees page with data from the database
app.get('/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees;');
    res.render('employees', { employees: result.rows });
  } catch (err) {
    console.error('Error fetching employees:', err.stack);
    res.status(500).send('Server Error');
  }
});

// Render the menu page with menu items from the database
app.get('/menuitems', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menuitems;');
    res.render('menu', { menuitems: result.rows });
  } catch (err) {
    console.error('Error fetching menu items:', err.stack);
    res.status(500).send('Server Error');
  }
});

// API Endpoints
app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees;');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err.stack);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.get('/api/menuitems', async (req, res) => {
  try {
    const result = await pool.query('SELECT menuitem, size, price FROM menuitems');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu items:', error.stack);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Additional APIs...

// File Download Endpoint
const downloadFolder = path.join(__dirname, '..', 'react', 'public', 'JSON Files');

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
    const response = await axios.get('http://localhost:5000/api/menuitems');
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

// Route to render the index (home) page
app.get('/', (req, res) => {
  res.render('index'); // Render the views/index.ejs file
});

// Route to render the index (home) page
app.get('/index', (req, res) => {
  res.render('index'); // Render the views/index.ejs file
});

// Route to render the menuBoard page
app.get('/menuBoard', (req, res) => {
  res.render('menuBoard'); // Render the views/menuBoard.ejs file
});

// Start the server
(async () => {
  const open = (await import('open')).default;
  await open(`http://localhost:${port}`);
})();

// Start the server and open the page in the default browser
app.listen(port, '127.0.0.1', async () => {
  console.log(`Server is running on port ${port}`);
  // Open the browser window after the server starts
  (async () => {
    const open = (await import('open')).default;
    await open(`http://localhost:${port}`);
  })();
});