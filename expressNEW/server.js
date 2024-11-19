////////////////////////////////////  BASIC BACKEND FUNCTIONALITY TO FETCH DATA FROM THE DATABASE OR UPDATE DATA IN THE DATABASE  ////////////////////////////////////



//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   ####################### SETTING UP THE BACKEND SERVER AND CONNECTING IT TO `PostgreSQL` DATABSE USING `pg` LIBRARY ###########################   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####

const qs = require('qs');
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

app.get('/register', (req, res) => {
  res.render('register'); // Render the views/register.ejs file
});

app.get('/menuBoard', (req, res) => {
  res.render('menuBoard'); // Render the views/menuBoard.ejs file
});

app.get('/kiosk', (req, res) => {
  res.render('kiosk'); // Render the views/kiosk.ejs file
});

app.get('/manager', (req, res) => {
  res.render('manager'); // Render the views/manager.ejs file
});

app.get('/kitchen', (req, res) => {
  res.render('kitchen'); // Render the views/kitchen.ejs file
});



//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   #######################################################  SETTING UP API ENDPOINTS  ###########################################################   |   ####
//#### \ | / ############################################################################################################################################## \ | / ####
//####  \|/  ##############################################################################################################################################  \|/  ####

// added steps for Google OAuth
// need more steps after reward system is added in database 
app.get('/api/sessions/oauth/google', async (req, res) => {
  const code = req.query.code;

  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URL,
    grant_type: 'authorization_code',
  };

  try {
    const result = await axios.post(url, qs.stringify(values), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { id_token, access_token } = result.data;

    const result2 = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    });

    const googleUser = result2.data;

    if (!googleUser.verified_email) {
      return res.status(403).send('Google account is not verified');
    }

    const user = {
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    };

    return res.redirect(`/kiosk`);
  } catch (err) {
    console.error('Error fetching OAuthSession', err.stack);
    res.status(500).send('Server Error');
  }
});

//API Endpoint to get OAuth information
app.get('/api/config', (req, res) => {
  res.json({
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      redirectUrl: process.env.REDIRECT_URL,
  });
});

// API Endpoint to get all the employees
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
      res.status(500).send('Server Error');
    }
  }
);

// API Endpoint to get the weather for College Station
app.get('/api/weather', async (req, res) => {
  const apiKey = process.env.WEATHER_KEY;  
  const lat = 30.6280;
  const lon = -96.3344;
  const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=imperial&appid=${apiKey}`;

  try {
      const result = await fetch(apiUrl);
      const data = await result.json();
      res.json(data);

  } catch (err) {
      console.error('Error fetching weather:', err.stack);
      res.status(500).send('Server Error');
  }
});

// API Endpoint to get the inventory
app.get('/api/inventory', async (req, res) => 
  {
    try
    {
      const result = await pool.query('SELECT * FROM inventory;');
      res.json(result.rows);
    }
    catch (err)
    {
      console.error('Error fetching iventory:', err.stack);
      res.status(500).send('Server Error');
    }
  }
);

// API Endpoint to get all the menu items
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


// API Endpoint to get the orderhistory
app.get('/api/orderHistory', async (req, res) =>
  {
    try
    {
      const result = await pool.query('SELECT * FROM orderhistory ORDER BY orderid DESC LIMIT 1000;');  
      res.json(result.rows); 
    }
    catch (err)
    {
      console.error('Error fetching orderhistory:', err.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

// API Endpoint to get restock report 
app.get('/api/restockReport', async (req, res) => {
  try {
    const query = `SELECT ingredient, quantity, minimumquantity
                   FROM inventory
                   WHERE quantity < minimumquantity
                   ORDER BY quantity DESC;`;
    const result = await pool.query(query);  
    res.json(result.rows); 
  } catch (err) {
    console.error('Error fetching restock report:', err.stack);
    res.status(500).json({ error: 'Server Error' });
  }
});

// API Endpoint for login
app.post('/api/login', async (req, res) =>
  {
    const {username, password} = req.body;
    try
    {
      userQuery = "SELECT * FROM employees WHERE employeeid = " + username;
      const result = await pool.query(userQuery);  

      const user = result.rows[0];

    if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    return res.json({ message: 'Login successful', user });
    }
    catch (err)
    {
      console.error('Error during login:', err.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

// API Endpoint to get sales report
app.get('/api/salesReport', async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' });
  }

  try {
    const startOrderQuery = `SELECT * FROM orderhistory WHERE date::date = $1::date ORDER BY date ASC LIMIT 1`;
    const startResult = await pool.query(startOrderQuery, [startDate]);

    const endOrderQuery = `SELECT * FROM orderhistory WHERE date::date = $1::date ORDER BY date DESC LIMIT 1`;
    const endResult = await pool.query(endOrderQuery, [endDate]);

    if (startResult.rowCount === 0 || endResult.rowCount === 0) {
      return res.status(404).json({ error: 'No results found for the given dates.' });
    }

    const startOrderId = startResult.rows[0].orderid;
    const endOrderId = endResult.rows[0].orderid;

    const countQuery = 'SELECT COUNT(*) FROM menuitems';
    const countResult = await pool.query(countQuery);
    const numberOfMenuItems = countResult.rows[0].count;

    const reportData = [];

    for (let i = 1; i <= numberOfMenuItems; i++) {
      const menuQuery = 'SELECT * FROM menuitems WHERE menuitemid = $1';
      const menuResult = await pool.query(menuQuery, [i]);

      if (menuResult.rowCount === 0) {
        continue; 
      }

      const { menuitem: item, price, size } = menuResult.rows[0];

      const orderQuery = `
        SELECT SUM(quantity) 
        FROM orderitems 
        WHERE menuitemid = $1 AND orderid >= $2 AND orderid <= $3
      `;
      const orderResult = await pool.query(orderQuery, [i, startOrderId, endOrderId]);

      const unitsSold = orderResult.rows[0].sum || 0; 
      const totalSales = price * unitsSold;

      reportData.push({
        menuitemid: i,
        item,
        size,
        totalSales,
        unitsSold
      });
    }

    res.json(reportData);

  } catch (err) {
    console.error('Error generating sales report:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

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
    const itemCountMap = new Map();

    menuItemIDs.forEach( 
      id =>
        { 
          itemCountMap.set(id, (itemCountMap.get(id) || 0) + 1); 
        } 
    );

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


// Endpoint to update inventory based on menu items
/**
  fetch('/api/updateinventory', 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ menuItemIDs: [1, 2, 3] }) // Sending an example array of menuItemIDs
    }
  )
  .then(response => response.json()) // Parse JSON response
  .then(data => console.log(data))    // Log the response data
  .catch(error => console.error('Error:', error)); // Handle any errors
*/
app.post('/api/updateinventory', async (req, res) => 
  {
    const { menuItemIDs } = req.body; // Get menuItemIDs from the request body
    
    if (!menuItemIDs || menuItemIDs.length === 0)
    {
      return res.status(400).json({ error: 'No menuItemIDs provided' });
    }

    const client = await pool.connect();

    try
    {
      const ingredientCountMap = new Map();

      // Loop through each menu item and accumulate ingredient usage
      for (const id of menuItemIDs)
      {
        const result = await client.query(
          'SELECT ingredient, quantity FROM menuitemingredients WHERE menuitemid = $1', 
          [id]
        );
        
        result.rows.forEach(row => {
          const ingredient = row.ingredient;
          const newQuantity = row.quantity;
          const currentQuantity = ingredientCountMap.get(ingredient) || 0;
          ingredientCountMap.set(ingredient, currentQuantity + newQuantity);
        });
      }

      // Loop through each ingredient and update the inventory
      for (const [ingredient, quantity] of ingredientCountMap.entries())
      {
        const quantityResult = await client.query(
          'SELECT quantityavailable, unit FROM inventory WHERE ingredient = $1', 
          [ingredient]
        );

        if (quantityResult.rows.length > 0)
        {
          const { quantityavailable, unit } = quantityResult.rows[0];
          let quantityToAdd = 0;

          if (quantityavailable === 0)
          {
            if (unit.toLowerCase() === 'unit')
            {
              quantityToAdd = 20;
            }
            else if (unit.toLowerCase() === 'lbs')
            {
              quantityToAdd = 5;
            }

            await client.query(
              'UPDATE inventory SET quantityavailable = quantityavailable + $1 WHERE ingredient = $2', 
              [quantityToAdd, ingredient]
            );

            await client.query(
              'UPDATE menuitemingredients SET quantity = quantity - $1 WHERE ingredient = $2', 
              [quantityToAdd, ingredient]
            );
          }

          // Update inventory by reducing the quantity used
          await client.query(
            'UPDATE inventory SET quantityavailable = GREATEST(quantityavailable - $1, 0) WHERE ingredient = $2', 
            [quantity, ingredient]
          );
        }
      }

      res.status(200).json({ message: 'Inventory updated successfully!' });
    }
    catch (error)
    {
      console.error('Error updating inventory:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  }
);


// Endpoint to update pending orders table
app.post('/api/updatependingorders', async (req, res) =>
{
  const { totalCost, menuItemIDs } = req.body; // Extract total cost and menu item IDs from request body

  const client = await pool.connect(); // Get a connection from the database pool

  try
  {
    await client.query('BEGIN'); // Start a database transaction

    // Insert the pending order into the table
    // Convert the menuItemIDs array to a JSON string using JSON.stringify
    const pendingOrderResult = await client.query(
      'INSERT INTO pendingorders (totalCost, date, menuitemids) VALUES ($1, $2, $3) RETURNING orderid',
      [totalCost, new Date(), JSON.stringify(menuItemIDs)] // Insert total cost, current timestamp, and menu item IDs
    );

    // Retrieve the newly created order ID from the result
    const newOrderID = pendingOrderResult.rows[0].orderid;

    await client.query('COMMIT'); // Commit the transaction to save changes
    res.status(200).json
    ({
      message: 'Pending order updated successfully!', // Send success message to client
      orderID: newOrderID, // Include the new order ID in the response
    });
  }
  catch (error)
  {
    console.error('Error updating pending order:', error); // Log any errors for debugging

    await client.query('ROLLBACK'); // Rollback the transaction if an error occurs
    res.status(500).json({ error: 'Failed to update pending order' }); // Send error response to client
  }
  finally
  {
    client.release(); // Release the database connection back to the pool
  }
});



//######################################################################  FEATURES ENDPOINTS  ########################################################################


//endpoint to get x report 
app.get('/api/xReport', async (req, res) => {
  const { date } = req.query; // Expecting date in 'YYYY-MM-DD' 

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  const client = await pool.connect();

  try {
    const startDate = `${date} 10:00:00`;
    const endDate = `${date} 22:00:00`;

    const result = await client.query(
      'SELECT EXTRACT(HOUR FROM date) AS hour, SUM(totalcost) AS total_sum ' +
      'FROM orderhistory ' +
      'WHERE date >= $1 AND date < $2 ' +
      'GROUP BY hour ' +
      'ORDER BY hour',
      [startDate, endDate]
    );

    const totalSum = result.rows.reduce((acc, row) => acc + (row.total_sum || 0), 0);

    result.rows.push({
      hour: 'Total',
      total_sum: totalSum
    });

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching x report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } 
});


/**
 * Validates if an ingredient exists in the inventory table.
 * This function queries the database asynchronously and returns a promise-based boolean.
 * 
 * Why use a promise? - We can't use simple booleans because database queries are asynchronous, and their results aren't available immediately.
 * 
 * @param {string} ingredient - Ingredient to validate.
 * @returns {Promise<boolean>} - Resolves to true if valid, false otherwise.
 */
async function isIngredientValid(ingredient)
{
  const validationQuery = "SELECT COUNT(*) FROM inventory WHERE LOWER(ingredient) = LOWER($1)";
  try
  {
    // Query the database with the ingredient (case-insensitive match)
    const result = await pool.query(validationQuery, [ingredient]);

    // Return true if count > 0, else false
    return result.rows[0].count > 0;
  }
  catch (error)
  {
    console.error('Error validating ingredient:', error);
    throw error; // Rethrow error for higher-level handling
  }
}


app.get('/api/product-usage', async (req, res) =>
  {
    const { ingredient, timeframe, month, day } = req.query;

    // Validate ingredient presence
    if (!ingredient)
    {
      return res.status(400).json({ message: 'Ingredient is required.' });
    }

    try
    {
      // Validate if the ingredient exists in the inventory table
      const isValidIngredient = await isIngredientValid(ingredient);
      if (!isValidIngredient)
      {
        return res.status(404).json({ message: `Ingredient '${ingredient}' does not exist in inventory.` });
      }

      let dateTrunc, dateFormat, buildDate, year = '2023';

      // Timeframe validation and setup
      if (timeframe === 'hourly')
      {
        if (!day)
        {
          return res.status(400).json({ message: 'Day is required for hourly data.' });
        }

        dateTrunc = 'hour';
        dateFormat = "YYYY-MM-DD HH24";  // Year, Month, Day, and Hour format
        buildDate = "AND TO_CHAR(oh.date, 'YYYY-MM-DD') = $1"; // Placeholder for prepared statement
      }
      else if (timeframe === 'daily')
      {
        if (!month)
        {
          return res.status(400).json({ message: 'Month is required for daily data.' });
        }

        dateTrunc = 'day';
        dateFormat = "YYYY-MM-DD";  // Year, Month, and Day format
        buildDate = "AND TO_CHAR(oh.date, 'YYYY-MM') = $1"; // Placeholder for prepared statement
      }
      else
      {
        // Default to monthly
        dateTrunc = 'month';
        dateFormat = "YYYY-MM";  // Year and Month format
        buildDate = "AND EXTRACT(YEAR FROM oh.date) = $1 AND EXTRACT(MONTH FROM oh.date) = $2";  // Fixed year 2023
      }

      // SQL Query construction
      const query = `
      SELECT inv.ingredient AS ingredient_name,
      ROUND(SUM(order_items.quantity * menu_ing.quantity)::numeric, 2) AS total_usage,
      TO_CHAR(DATE_TRUNC($1, oh.date), $2) AS time_period
      FROM orderhistory oh
      JOIN orderitems order_items ON oh.orderid = order_items.orderid
      JOIN menuitemingredients menu_ing ON order_items.menuitemid = menu_ing.menuitemid
      JOIN inventory inv ON menu_ing.ingredient = inv.ingredient
      WHERE LOWER(inv.ingredient) = $3
      ${buildDate}
      GROUP BY inv.ingredient, time_period
      ORDER BY time_period;
      `;

      // Execute the query with dynamic parameters
      const params = [dateTrunc, dateFormat, ingredient.toLowerCase()];

      if (timeframe === 'hourly')
      {
        params.push(day); // For hourly, use day
      }
      else if (timeframe === 'daily')
      {
        params.push(month); // For daily, use month
      }
      else if (timeframe === 'monthly')
      {
        params.push(year, month); // For monthly, use year (fixed to 2023) and month
      }

      const result = await client.query(query, params);

      // Format the result into a response
      const productUsageList = result.rows.map(row => 
      ({
        ingredient_name: row.ingredient_name,
        total_usage: row.total_usage,
        time_period: row.time_period,
      }));

      if (productUsageList.length === 0)
      {
        return res.status(404).json({ message: `No usage data found for ingredient: ${ingredient}` });
      }

      return res.json(productUsageList);
    }
    catch (error)
    {
      console.error('Error fetching product usage data:', error);
      return res.status(500).json({ message: 'An error occurred while fetching product usage data.' });
    }
  }
);



//####   |   ##############################################################################################################################################   |   ####
//####   |   ##############################################################################################################################################   |   ####
//####   |   ################################################################ File Download ###############################################################   |   ####
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
