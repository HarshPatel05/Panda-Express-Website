////////////////////////////////////  BASIC BACKEND FUNCTIONALITY TO FETCH DATA FROM THE DATABASE OR UPDATE DATA IN THE DATABASE  ////////////////////////////////////



//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   ####################### SETTING UP THE BACKEND SERVER AND CONNECTING IT TO `PostgreSQL` DATABSE USING `pg` LIBRARY ###########################   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####


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


//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   ############################################################# RENDERING THE PAGES ############################################################   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####


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




//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   #######################################################  SETTING UP API ENDPOINTS  ###########################################################   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####


// Render the employees page with data from the database
app.get('/employees', async (req, res) => 
  {
    try
    {
      const result = await pool.query('SELECT * FROM employees;');
      res.json(result.rows);
    }
    catch (err)
    {
      console.error('Error fetching employees:', err.stack);
      res.status(500).send('Server Error');
    }
  }
);


//endpoint to get x report 
app.get('/api/xreport', async (req, res) =>
  {
    const date = req.body; // Expecting date in 'YYYY-MM-DD' format
  
    const client = await pool.connect();
  
    try
    {
      const result = await client.query(
        'SELECT EXTRACT(HOUR FROM date) AS hour, SUM(totalcost) AS total_sum FROM orderhistory WHERE date >= $1 AND date < $2 GROUP BY hour ORDER BY hour ',
        ['${date} 10:00', '${date} 22:00']
      );
  
      res.json(result.rows);
    }
    catch (error)
    {
      console.error("Error fetching x report:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } 
    finally
    {
      client.release();
    }
  }
);


// API Endpoint to get all menu items
app.get('/api/menuitems', async (req, res) => 
  {
    try 
    {
      const result = await pool.query('SELECT menuItemId, menuItem, price, size, displayName FROM menuItems');
      res.json(result.rows);
    } 
    catch (error) 
    {
      console.error('Error fetching menu items:', error.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);


// API request to update an order
/**
 * fetch('/api/updateorders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
    {
      totalCost: 25.50,
      menuItemIDs: [1, 2, 3]  // Example data
    })
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error updating order:', error));

 */
app.post('/api/updateorders', async (req, res) => 
  {
    const { totalCost, menuItemIDs } = req.body;

    // Create a map to count occurrences of each menuItemID
    const itemCountMap = menuItemIDs.reduce((acc, id) =>
    {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const client = await pool.connect();

    try 
    {
      // we use `BEGIN` like this, when we have to execute multiple queries in the same database connection
      await client.query('BEGIN'); // Start transaction

      // Insert into orderhistory and get the new orderID
      const orderHistoryResult = await client.query(
        'INSERT INTO orderhistory (totalCost, date) VALUES ($1, $2) RETURNING orderid',
        [totalCost, new Date()] // Insert current timestamp
      );

      const newOrderID = orderHistoryResult.rows[0].orderid;

      // Prepare to insert into orderitems
      const orderItemsQuery = 'INSERT INTO orderitems (orderid, menuitemid, quantity) VALUES ($1, $2, $3)';
      const orderItemsPromises = Object.entries(itemCountMap).map(([menuItemID, quantity]) => {
        return client.query(orderItemsQuery, [newOrderID, parseInt(menuItemID), quantity]);
      });

      // Execute all insert queries in parallel
      await Promise.all(orderItemsPromises);

      // Commit the transaction
      await client.query('COMMIT');
      
      // Respond with a simple success message
      res.status(200).json({ message: 'Order updated successfully!' });
    }
    catch (error)
    {
      console.error('Error updating order:', error);

      // Rollback transaction on error
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'Failed to update order' });
    }
    finally
    {
      client.release();
    }
  }
);



//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   ############################################################### UHH... Voodoo? ###############################################################   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####


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




//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   ######## AFTER DEFINING ALL THE API ENDPOINTS, START THE SERVER AND LISTEN FOR ANY INCOMING REQUESTS(API CALLS) FROM THE FRONTEND ############   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####

/** This piece of code need to be in end o ensure all routes and middleware are set up before the server starts listening for requests.
 * 
 * Its purpose is to start the Express server and tells it to listen of incoming HTTP requests on a specific port 
*/

// Start the server
app.listen(port, '0.0.0.0', async () => {
  console.log(`Server is running on port ${port}`);
});
