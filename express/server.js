////////////////////////////////////  BASIC BACKEND FUNCTIONALITY TO FETCH DATA FROM THE DATABASE OR UPDATE DATA IN THE DATABASE  ////////////////////////////////////





//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   ####################### SETTING UP THE BACKEND SERVER AND CONNECTING IT TO `PostgreSQL` DATABSE USING `pg` LIBRARY ###########################   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####


/** Initial Setup and Configuration
 *  Express is required to create and manage the web server.
 *  pg is the PostgreSQL client for Node.js, allowing us to connect to and query a PostgreSQL database.
 *  dotenv is used to load environment variables from a .env file
**/
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();


/** Create the Express App and Enable CORS
 * app is the main Express application.
 * CORS (Cross-Origin Resource Sharing) is enabled to allow the frontend (running on a different port) to communicate with this server.
 */
const app = express();
const cors = require('cors');
app.use(cors());


/** Database Connection Pool
 * Pool is used to manage a group of connections to the database
 */
const pool = new Pool
(
  {
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    database: process.env.PSQL_DATABASE,
    password: process.env.PSQL_PASSWORD,
    port: process.env.PSQL_PORT,
    ssl: {rejectUnauthorized: false}
  }
)

// This code establishes a connection to the database and logs a message to confirm the connection or to print any errors.
pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Database connection error:', err.stack));





//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   #######################################################  SETTING UP API ENDPOINTS  ###########################################################   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####


// API request to get all the of employees
app.get('/api/employees', async (req, res) =>
  {
    try
    {
      const result = await pool.query('SELECT * FROM employees;');  
      res.json(result.rows); 
    }
    catch (err)
    {
      console.error('Error fetching employees:', err.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);


// API request to get all the of menuitems
app.get('/api/menuitems', async (rec, res) =>
  {
    try
    {
      const query = `SELECT menuitem, size, price FROM menuitems WHERE size = 'sm' OR size = 'md' OR size = 'lg';`;
      const result = await pool.query(query);
      res.json(result.rows);
    }
    catch(error)
    {
      console.error('Error fetching menu items:', error.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);


// API Request to get the all the menuItemIds associated with the given menuItem name
app.get('/api/menu/:name', async (req, res) =>
  { 

    const menuName = req.params.name;  // Extract menuName from request parameters
    
    try 
    {
      // Query the database for menuItemId by menuItem name
      const result = await pool.query( 'SELECT menuitemID FROM menuitems WHERE menuitem = $1', [menuName] );
        
      // Check if a matching menu item was found
      if (result.rows.length > 0)
      {
        // If true, it sends a JSON response with the menuItemId from the first row
        res.json({ menuItemId: result.rows[0].menuItemid });
      }
      else
      {
        // If no rows were found, it sends a 404 (Not Found) status with a message, indicating the item doesn’t exist in the database
        res.status(404).json({ message: 'Menu item not found' });
      }
    } 
    catch (err) // catch any error while querying the database
    {
      console.error('Error fetching menu item:', err.stack);
      res.status(500).send('Server error');
    }

  }
);


// API Request to get menuItemId and price when given the menuItem name and size
app.get('/api/menu/:name/:size', async (req, res) => 
  {

    const { name, size } = req.params;  // Extract 'name' and 'size' from URL parameters

    try 
    {
      // Query the database for menuItemId and price based on menuItem name and size
      const query = 'SELECT menuItemId, price FROM menuItems WHERE menuItem = $1 AND size = $2';
      const result = await pool.query(query, [name, size]);

      // Check if any result was found for the provided name and size
      if (result.rows.length > 0)
      {
        // If found, extract 'menuitemid' and 'price' from the first result ro
        const { menuitemid, price } = result.rows[0];

        // Send the menuItemId and price as a JSON response
        res.json({ menuItemId: menuitemid, menuItemName: name, menuItemSize: size , menuItemPrice: price });
      } 
      else
      {
        // If no matching item is found, send a 404 status with a 'not found' message
        res.status(404).json({ message: 'Menu item not found' });
      }
    } 
    catch (err)
    {
      // Log any error that occurs during the database query
      console.error('Error fetching menu item:', err.stack);

      // Send a 500 status indicating a server error
      res.status(500).send('Server error');
    }
  }
);


// API request to update an order
/**
 * fetch('/api/orders', 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify
        ({
          totalCost: 25.50,
          menuItemIDs: [1, 2, 3]
        })
      }
    )
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
 */
app.post('/api/orders', async (req, res) => 
  {

    const { totalCost, menuItemIDs } = req.body;

    // Create a map to count occurrences of each menuItemID
    const itemCountMap = menuItemIDs.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const client = await pool.connect();

    try
    {
      await client.query('BEGIN');  // Start transaction

      // Insert into orderhistory and get the new orderID
      const orderHistoryResult = await client.query
      (
        'INSERT INTO orderhistory (totalCost, date) VALUES ($1, $2) RETURNING orderid',
        [totalCost, new Date()]  // Insert current timestamp
      );

      const newOrderID = orderHistoryResult.rows[0].orderID;

      // Prepare to insert into orderitems
      const orderItemsQuery = 'INSERT INTO orderitems (orderid, menuitemid, quantity) VALUES ($1, $2, $3)';
      const orderItemsPromises = Object.entries(itemCountMap).map(([menuItemID, quantity]) => 
        {
          return client.query(orderItemsQuery, [newOrderID, parseInt(menuItemID), quantity]);
        }
      );

      // Execute all insert queries in parallel
      await Promise.all(orderItemsPromises);

      // Commit the transaction
      await client.query('COMMIT');
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
//####   |   ######## AFTER DEFINING ALL THE API ENDPOINTS, START THE SERVER AND LISTEN FOR ANY INCOMING REQUESTS(API CALLS) FROM THE FRONTEND ############   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####

/** This piece of code need to be in end o ensure all routes and middleware are set up before the server starts listening for requests.
 * 
 * Its purpose is to start the Express server and tells it to listen of incoming HTTP requests on a specific port.
 * It also logs a confiermation message to the console, so you know the server is up and running.
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  {
    console.log(`Server is running on port ${PORT}`);
  }
);