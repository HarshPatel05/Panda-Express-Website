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
const { DateTime } = require('luxon');
const PlayHT = require('playht');

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

// app.get('/kitchen', (req, res) => {
//   res.render('kitchen'); // Render the views/kitchen.ejs file
// });

// Route to render the kitchen page
app.get('/kitchen', async (req, res) =>
{
  try
  {
    // Fetch pending orders using the API endpoint
    const pendingOrders = await fetchPendingOrdersFromAPI();
    
    res.render('kitchen', { pendingOrders });
  }
  catch (error)
  {
    console.error('Error loading the kitchen page:', error);
    res.status(500).send('Error loading the kitchen page');
  }
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


// Initialize PlayHT client
PlayHT.init({
  userId: process.env.TTS_USER_ID,
  apiKey: process.env.TTS_KEY,
});

const CUSTOM_VOICE_ID = 's3://voice-cloning-zero-shot/2e1ff2b9-48cf-4fd9-b48a-45a61cbc3b18/original/manifest.json'; // Replace with your custom voice ID


// API Endpoint to generate audio
app.get('/api/generate-audio', async (req, res) => {
    const text = req.query.text;
    if (!text) {
        return res.status(400).send('Text parameter is required');
    }

    try {
        // Use the custom voice ID for text-to-speech
        const stream = await PlayHT.stream(text, { voiceId: CUSTOM_VOICE_ID });

        // Stream the audio back to the client
        res.setHeader('Content-Type', 'audio/mpeg');
        stream.pipe(res);
    } catch (error) {
        console.error('Error generating audio:', error);
        res.status(500).send('Error generating audio');
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

app.get('/api/restockInventory', async (req, res) => {
  const { ingredientName } = req.query;

  if (!ingredientName) {
    return res.status(400).json({ error: 'Ingredient name is required.' });
  }

  const queryGetValues = 'SELECT quantity, minimumquantity FROM inventory WHERE ingredient = $1';

  try {
    // Fetch current quantity and minimum quantity
    const result = await pool.query(queryGetValues, [ingredientName]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No inventory item found with the name: ${ingredientName}` });
    }

    const { quantity, minimumquantity } = result.rows[0];
    const targetQuantity = minimumquantity * 1.25;

    // If current quantity is less than the target quantity, restock it
    if (quantity < targetQuantity) {
      const queryUpdate = `
        UPDATE inventory
        SET lastShipment = CURRENT_DATE, quantity = minimumquantity * 1.25
        WHERE ingredient = $1
      `;
      await pool.query(queryUpdate, [ingredientName]);

      console.log(`Successfully restocked inventory for: ${ingredientName}`);
      return res.status(200).json({ message: `Restocked ${ingredientName} to the minimum amount.` });
    } else {
      console.log(`No need to restock for: ${ingredientName}`);
      return res.status(200).json({ message: `No need to restock ${ingredientName}. Current quantity is sufficient.` });
    }
  } catch (err) {
    console.error('Error restocking inventory:', err);
    return res.status(500).json({ error: 'Server Error' });
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

  // Ensure both start and end dates are provided
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' });
  }

  try {
    // Parse and format dates using Luxon
    const formattedStartDate = DateTime.fromISO(startDate).toFormat('yyyy-MM-dd');
    const formattedEndDate = DateTime.fromISO(endDate).toFormat('yyyy-MM-dd');

    // Query to get the first order within the date range
    const startOrderQuery = `
      SELECT * 
      FROM orderhistory 
      WHERE date::date >= $1::date AND date::date <= $2::date
      ORDER BY date ASC LIMIT 1
    `;
    const startResult = await pool.query(startOrderQuery, [formattedStartDate, formattedEndDate]);

    // Query to get the last order within the date range
    const endOrderQuery = `
      SELECT * 
      FROM orderhistory 
      WHERE date::date >= $1::date AND date::date <= $2::date
      ORDER BY date DESC LIMIT 1
    `;
    const endResult = await pool.query(endOrderQuery, [formattedStartDate, formattedEndDate]);

    // If no orders found in the specified date range
    if (startResult.rowCount === 0 || endResult.rowCount === 0) {
      return res.status(404).json({ error: 'No results found for the given dates.' });
    }

    // Extract order IDs
    const startOrderId = startResult.rows[0].orderid;
    const endOrderId = endResult.rows[0].orderid;

    // Query to count the total number of menu items
    const countQuery = 'SELECT COUNT(*) FROM menuitems';
    const countResult = await pool.query(countQuery);
    const numberOfMenuItems = countResult.rows[0].count;

    // Initialize the report data
    const reportData = [];

    // Loop through each menu item to calculate the sales report
    for (let i = 1; i <= numberOfMenuItems; i++) {
      const menuQuery = 'SELECT * FROM menuitems WHERE menuitemid = $1';
      const menuResult = await pool.query(menuQuery, [i]);

      if (menuResult.rowCount === 0) {
        continue;  // Skip if no menu item found for the given id
      }

      const { menuitem: item, price, size } = menuResult.rows[0];

      // Query to get the total units sold for each menu item within the order range
      const orderQuery = `
        SELECT SUM(quantity) 
        FROM orderitems 
        WHERE menuitemid = $1 AND orderid >= $2 AND orderid <= $3
      `;
      const orderResult = await pool.query(orderQuery, [i, startOrderId, endOrderId]);

      const unitsSold = orderResult.rows[0].sum || 0;  // Default to 0 if no units sold
      const totalSales = price * unitsSold;  // Calculate total sales

      // Push data into the report array
      reportData.push({
        menuitemid: i,
        item,
        size,
        totalSales,
        unitsSold
      });
    }

    // Return the sales report data as JSON
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
  const { totalCost, menuItemIDs, inputName } = req.body;

  // Log request body for debugging
  console.log('Received:', req.body);

  // Validate required fields
  if (!totalCost || !menuItemIDs || !Array.isArray(menuItemIDs) || menuItemIDs.length === 0 || !inputName)
  {
    return res.status(400).json({ error: 'Invalid input: TotalCost, MenuItemIDs (array), and Name are required' });
  }

  const client = await pool.connect(); // Get a connection from the database pool

  try
  {
    await client.query('BEGIN'); // Start a database transaction

    console.log('Inserting into pending orders:', { totalCost, menuItemIDs, inputName });

    // Insert the pending order into the table
    const query = `
      INSERT INTO pendingorders (totalcost, menuitemids, name) 
      VALUES ($1, $2, $3) 
      RETURNING pendingorderid
    `;

    const values = [totalCost, JSON.stringify(menuItemIDs), inputName];
    const pendingOrderResult = await client.query(query, values);

    // Retrieve the newly created order ID
    const pendingOrderID = pendingOrderResult.rows[0].pendingorderid;

    await client.query('COMMIT'); // Commit the transaction

    res.status(200).json
    ({
      message: 'Pending order updated successfully!',
      orderID: pendingOrderID,
    });
  }
  catch (error)
  {
    console.error('Error updating pending order:', error.stack);

    await client.query('ROLLBACK'); // Rollback on error
    res.status(500).json({ error: 'Failed to update pending order' });
  }
  finally
  {
    client.release(); // Release the database connection
  }
});



// API enpoint to get pending orders to display it on the screen
app.get('/api/getpendingorders', async (req, res) =>
{
  try
  {
    const result =  await pool.query('SELECT * FROM pendingorders;');
    res.json(result.rows);
  }
  catch(err)
  {
    console.error('Error fetching Pending Orders:', err.stack);
    res.status(500).json({ error: 'Server Error' });
  }
});


const fetchPendingOrdersFromAPI = async () =>
{
  try
  {
    const response = await fetch('http://localhost:5000/api/getpendingorders'); // Full URL for the API
    if (!response.ok) throw new Error('Failed to fetch pending orders');
    return await response.json();  // Parse JSON data from API
  }
  catch (error)
  {
    console.error('Error fetching pending orders:', error);
    throw error;  // Rethrow error to handle it in the route
  }
};


app.get('/api/getdisplayname', async (req, res) =>
{
  const menuitemID = req.query.menuitemID; // Extract menuitemID from the query string

  if (!menuitemID)
  {
    return res.status(400).send({ error: 'menuitemID is required' }); // Validate input
  }

  try
  {
    // Query the database for the display name
    // const result = await pool.query('SELECT displayname FROM menuitems WHERE menuitemid = $1', [menuitemID]);
    const result = await pool.query('SELECT menuitem FROM menuitems WHERE menuitemid = $1', [menuitemID]);

    // Check if a result was found
    if (result.rows.length > 0)
    {
      // return res.send(result.rows[0].displayname);
      return res.send(result.rows[0].menuitem);
    }
    else
    {
      return res.status(404).send('Menu item not found');
    }
  }
  catch(err)
  {
    console.error('Error fetching display name:', err.stack);
    return res.status(500).send('Server Error');
  };
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



/** API endpoint to get product usage
 *  This endpoint retrieves the product usage data for a specific ingredient based on the given timeframe (hourly, daily, or monthly).
 * 
 * The timeframe can be:

    1. 'hourly' - For hourly data on a specific day (requires 'day' parameter in the format YYYY-MM-DD).
      Example: /api/product-usage?ingredient=chicken&timeframe=hourly&day=2024-03-19
      This will fetch the ingredient usage for 'chicken' on August 15, 2024, broken down by hour.

    2. 'daily' - For daily data in a specific month (requires 'month' parameter in the format YYYY-MM).
      Example: /api/product-usage?ingredient=chicken&timeframe=daily&month=2024-03
      This will fetch the ingredient usage for 'chicken' for the entire month of August 2024, broken down by day.

    3. 'monthly' - For monthly data in a specific year (requires 'year' parameter in the format YYYY).
      Example: /api/product-usage?ingredient=chicken&timeframe=monthly&year=2024
      This will fetch the ingredient usage for 'chicken' for the year 2024, broken down by month.

 */
app.get('/api/product-usage', async (req, res) =>
{
  const { ingredient, timeframe, year, month, day } = req.query;

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

    // Define variables for query construction
    let dateTrunc, dateFilter = '', dateFormat, params = [ingredient.toLowerCase()];

    // Handle timeframe validation and SQL setup
    if (timeframe === 'hourly')
    {
      if (!day)
      {
        return res.status(400).json({ message: 'Day is required for hourly data (format: YYYY-MM-DD).' });
      }

      dateTrunc = 'hour';
      dateFormat = 'YYYY-MM-DD HH24'; // Year, Month, Day, and Hour format
      dateFilter = "AND TO_CHAR(oh.date, 'YYYY-MM-DD') = $2";
      params.push(day);

    }

    else if (timeframe === 'daily')
    {
      if (!month)
      {
        return res.status(400).json({ message: 'Month is required for daily data (format: YYYY-MM).' });
      }

      dateTrunc = 'day';
      dateFormat = 'YYYY-MM-DD'; // Year, Month, and Day format
      dateFilter = "AND TO_CHAR(oh.date, 'YYYY-MM') = $2";
      params.push(month);
    }

    else if (timeframe === 'monthly')
    {
      if (!year)
      {
        return res.status(400).json({ message: 'Year is required for monthly data (format: YYYY).' });
      }

      dateTrunc = 'month';
      dateFormat = 'YYYY-MM'; // Year and Month format
      dateFilter = "AND EXTRACT(YEAR FROM oh.date) = $2";
      params.push(year);
    }

    else
    {
      return res.status(400).json({ message: 'Invalid timeframe. Valid options are: hourly, daily, monthly.' });
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
      ${dateFilter}
      GROUP BY inv.ingredient, time_period
      ORDER BY time_period;
    `;

    console.log('Executing query:', query); // For debugging

    // Execute the query
    const result = await client.query(query, [dateTrunc, dateFormat, ...params]);

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
});


// API Endpoint to add a seasonal entree
/**
  fetch('/api/addseasonalentree', 
    {
      method: 'POST',
      headers:{ 'Content-Type': 'application/json' },
      body: JSON.stringify
      ({
        itemName = "frenchFries"
        itemPrice = 
      }) 
    }
  )
  .then(response => response.json()) // Parse JSON response
  .then(data => console.log(data))    // Log the response data
  .catch(error => console.error('Error:', error)); // Handle any errors
*/
app.post('/api/addseasonalentree', async (req, res) =>
{
  const { itemName, itemPrice, itemIngredients, quantities, displayname } = req.body;
});




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
