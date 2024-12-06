/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
////////////////////////////////////////////     SETTING UP THE BACKEND SERVER AND CONNECTIVITY WITH DATABASE      //////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Required modules and configurations.
 * - Sets up Express for routing and middleware.
 * - Configures PostgreSQL connectivity using environment variables.
 * - Includes utilities like axios, luxon, and PlayHT.
*/
const qs = require('qs');
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv').config();
const cors = require('cors');
const path = require('path');
const moment = require('moment');
const fs = require('fs');
const axios = require('axios');
const { DateTime } = require('luxon');
const PlayHT = require('playht');

const app = express();
const port = process.env.PORT || 5000;


/**
 * Sets up view engine and middleware.
 * - View engine: EJS for rendering HTML views.
 * - Middleware: Static file serving, JSON parsing, and CORS.
*/
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


/**
 * PostgreSQL connection pool setup.
 * - Reads database connection details from environment variables.
 * - Supports optional SSL for secure connections.
 */
const pool = new Pool
({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD,
  port: process.env.PSQL_PORT,
  ssl: process.env.PSQL_SSL === 'true' ? { rejectUnauthorized: false } : false,
});




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
////////////////////////////////////////////                           RENDERING THE PAGES                         //////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/**
 * Routes for rendering pages.
 * - Renders different views (e.g., index, register, menuBoard) using EJS.
 * - Each route serves a specific webpage.
*/
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

app.get('/specialboard', (req, res) => {
  res.render('specialBoard'); // Render the views/specialBoard.ejs file
});





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
////////////////////////////////////////////                         SETTING UP API ENDPOINTS                      //////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Endpoint to add a new ingredient.
 * @route POST /api/addIngredient
 * @param {string} name - Ingredient's name.
 * @param {string} unit - Ingredient's unit (e.g., kg, lb).
 * @param {number} quantity - Quantity of the ingredient.
 * @param {string} vendor - Ingredient's vendor.
 * @param {string} lastShipmentDate - Date of the last shipment.
 * @param {number} minQuantity - Minimum quantity for the ingredient.
 * @returns {object} 201 - Ingredient added successfully with the new ingredient's data.
 * @returns {object} 400 - Missing required fields.
 * @returns {object} 500 - Error adding ingredient.
 */
app.post('/api/addIngredient', async (req, res) => {
  const { name, unit, quantity, vendor, lastShipmentDate, minQuantity } = req.body;

  if (!name || !unit || !quantity || !vendor || !lastShipmentDate || !minQuantity) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  const query = `
      INSERT INTO inventory (ingredient, unit, quantityavailable, quantity, vendor, lastshipment, minimumquantity)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
  `;

  try {
      const result = await pool.query(query, [name, unit, 0, quantity, vendor, lastShipmentDate, minQuantity]);
      res.status(201).json({ message: 'Ingredient added successfully.', ingredient: result.rows[0] });
  } catch (error) {
      res.status(500).json({ message: 'Error adding ingredient.', error: error.message });
  }
});


/**
 * Endpoint to delete an ingredient by name.
 * @route DELETE /api/deleteIngredient/:name
 * @param {string} name - Ingredient's name to delete.
 * @returns {object} 200 - Ingredient deleted successfully.
 * @returns {object} 404 - Ingredient not found.
 * @returns {object} 500 - Error deleting ingredient.
 */
app.delete('/api/deleteIngredient/:name', async (req, res) => {
  const ingredientName = req.params.name;

  const query = `
      DELETE FROM inventory
      WHERE ingredient = $1
      RETURNING *;
  `;

  try {
      const result = await pool.query(query, [ingredientName]);
      
      if (result.rowCount === 0) {
          return res.status(404).json({ message: 'Ingredient not found.' });
      }

      res.status(200).json({ message: `Ingredient ${ingredientName} deleted successfully.`, ingredient: result.rows[0] });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting ingredient.', error: error.message });
  }
});

/**
 * Endpoint to update an ingredient by name.
 * @route PUT /api/updateIngredient/:name
 * @param {string} name - Ingredient's name to update.
 * @param {string} field - Field to update (e.g., 'quantity', 'vendor').
 * @param {string|number} value - New value for the field.
 * @returns {object} 200 - Ingredient updated successfully with the updated data.
 * @returns {object} 400 - Missing required fields or invalid data.
 * @returns {object} 404 - Ingredient not found.
 * @returns {object} 500 - Error updating ingredient.
 */
app.put('/api/updateIngredient/:name', async (req, res) => {
  const ingredientName = req.params.name;
  const { field, value } = req.body;

  if (!field || !value) {
      return res.status(400).json({ message: 'Field and value are required.' });
  }

  const query = `
      UPDATE inventory
      SET ${field} = $1
      WHERE ingredient = $2
      RETURNING *;
  `;

  try {
      const result = await pool.query(query, [value, ingredientName]);
      
      if (result.rowCount === 0) {
          return res.status(404).json({ message: 'Ingredient not found.' });
      }

      res.status(200).json({ message: 'Ingredient updated successfully.', ingredient: result.rows[0] });
  } catch (error) {
      res.status(500).json({ message: 'Error updating ingredient.', error: error.message });
  }
});

/**
 * Endpoint to create a new employee.
 * @route POST /api/createEmployee
 * @param {string} name - Employee's name.
 * @param {string} id - Employee ID.
 * @param {string} password - Employee password.
 * @param {string} status - Employment status (e.g., active, inactive).
 * @param {string} phone - Employee's phone number.
 * @param {string} position - Employee's position.
 * @returns {object} 201 - Employee created successfully with the new employee's data.
 * @returns {object} 400 - Missing required fields.
 * @returns {object} 500 - Error creating employee.
 */

app.post('/api/createEmployee', async (req, res) => {
  const { name, id, password, status, phone, position } = req.body;
  if (!name || !id || !password || !status || !phone || !position) {
      return res.status(400).json({ message: 'All fields are required.' });
  }
  const query = `
      INSERT INTO employees (employeeid, name, password, status, phonenumber, position)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
  `;
  try {
      const result = await pool.query(query, [id, name, password, status, phone, position]);
      res.status(201).json({ message: 'Employee created successfully.', employee: result.rows[0] });
  } catch (error) {
      res.status(500).json({ message: 'Error creating employee.', error: error.message });
  }
});


/**
 * Endpoint to delete an employee by ID.
 * @route DELETE /api/deleteEmployee/:id
 * @param {string} id - Employee ID.
 * @returns {object} 200 - Employee deleted successfully.
 * @returns {object} 404 - Employee not found.
 * @returns {object} 500 - Error deleting employee.
 */
app.delete('/api/deleteEmployee/:id', async (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM employees WHERE employeeid = $1 RETURNING *;`;
  try {
      const result = await pool.query(query, [id]);
      if (result.rowCount === 0) {
          return res.status(404).json({ message: `Employee with ID ${id} not found.` });
      }
      res.status(200).json({ message: `Employee with ID ${id} deleted successfully.` });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting employee.', error: error.message });
  }
});


/**
 * Endpoint to update an employee's field by ID.
 * @route PUT /api/updateEmployee/:id
 * @param {string} id - Employee ID.
 * @param {string} field - Field to update (e.g., name, password, status, phonenumber, position)
 * @param {string} value - New value for the specified field.
 * @returns {object} 200 - Employee updated successfully with the updated employee's data.
 * @returns {object} 400 - Invalid field to update.
 * @returns {object} 404 - Employee not found.
 * @returns {object} 500 - Error updating employee.
 */
app.put('/api/updateEmployee/:id', async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  const allowedFields = ['name', 'password', 'status', 'phonenumber', 'position'];
  if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field to update.' });
  }

  const query = `UPDATE employees SET ${field} = $1 WHERE employeeid = $2 RETURNING *;`;

  try {
      const result = await pool.query(query, [value, id]);
      if (result.rowCount === 0) {
          return res.status(404).json({ message: `Employee with ID ${id} not found.` });
      }
      res.status(200).json({ message: `Employee with ID ${id} updated successfully.`, employee: result.rows[0] });
  } catch (error) {
      res.status(500).json({ message: 'Error updating employee.', error: error.message });
  }
});


/**
 * Endpoint to delete an order by ID.
 * @route DELETE /api/orders/:id
 * @param {string} id - Order ID.
 * @returns {object} 200 - Order deleted successfully.
 * @returns {object} 404 - Order not found.
 * @returns {object} 500 - Error deleting order.
 */
app.delete('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;

  try {
      const result = await pool.query('DELETE FROM orderhistory WHERE orderid = $1 RETURNING *', [orderId]);

      if (result.rowCount > 0) {
          res.status(200).json({ message: `Order ${orderId} deleted successfully.` });
      } else {
          res.status(404).json({ message: `Order ${orderId} not found.` });
      }
  } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: 'An error occurred while deleting the order.' });
  }
});

/**
 * Endpoint to authenticate an employee via Google OAuth.
 * @route GET /api/sessions/oauth/employee/google
 * @param {string} code - Authorization code from Google OAuth.
 * @returns Redirect to correct view with user's name if successful.
 * @returns {string} 403 - Google account is not verified.
 * @returns {string} 500 - Server error.
 */
app.get('/api/sessions/oauth/employee/google', async (req, res) => {
  const code = req.query.code;

  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: process.env.GOOGLE_EMPLOYEE_CLIENT_ID,  
    client_secret: process.env.GOOGLE_EMPLOYEE_CLIENT_SECRET,  
    redirect_uri: process.env.EMPLOYEE_REDIRECT_URL,  
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

    const googleEmployee = result2.data;

    if (!googleEmployee.verified_email) {
      return res.status(403).send('Google account is not verified');
    }

    const employee = {
      email: googleEmployee.email,
      name: googleEmployee.name,
      picture: googleEmployee.picture,
    };

    return res.redirect(`/index?name=${encodeURIComponent(employee.name)}`);

  } catch (err) {
    console.error('Error fetching employee OAuth session', err.stack);
    res.status(500).send('Server Error');
  }
});


/**
 * Endpoint to authenticate a user via Google OAuth.
 * @route GET /api/sessions/oauth/google
 * @param {string} code - Authorization code from Google OAuth.
 * @returns Redirect to kiosk page with user's email if successful.
 * @returns {string} 403 - Google account is not verified.
 * @returns {string} 500 - Server error.
 */
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

    return res.redirect(`/kiosk?email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    console.error('Error fetching OAuthSession', err.stack);
    res.status(500).send('Server Error');
  }
});


/**
 * Endpoint to retrieve OAuth configuration.
 * @route GET /api/config
 * @returns {object} 200 - Google OAuth configuration (client ID and redirect URL).
 */
app.get('/api/config', (req, res) => {
  res.json({
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      redirectUrl: process.env.REDIRECT_URL,
  });
});

/**
 * Endpoint to retrieve OAuth configuration for employees.
 * @route GET /api/config
 * @returns {object} 200 - Google OAuth configuration (client ID and redirect URL).
 */
app.get('/api/configEmployee', (req, res) => {
  res.json({
      googleClientId: process.env.GOOGLE_EMPLOYEE_CLIENT_ID,
      redirectUrl: process.env.EMPLOYEE_REDIRECT_URL,
  });
});



/**
 * Endpoint to retrieve all employees.
 * @route GET /api/employees
 * @returns {array} 200 - Array of employees.
 * @returns {string} 500 - Server error.
 */
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


/**
 * Endpoint to fetch the current weather for College Station.
 * @route GET /api/weather
 * @returns {object} 200 - Current weather data.
 * @returns {string} 500 - Server error.
 */
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

const CUSTOM_VOICE_ID = 's3://voice-cloning-zero-shot/92519089-3c97-4f31-8743-ab4f06047b88/larrysaad/manifest.json'; // Replace with your custom voice ID

/**
 * Generate audio using PlayHT API.
 * @route GET /api/generate-audio
 * @param {string} text - Text to convert to audio.
 * @returns {audio/mpeg} 200 - Audio stream.
 * @returns {string} 400 - Missing text parameter.
 * @returns {string} 500 - Error generating audio.
 */
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


/**
 * Endpoint to retrieve inventory items.
 * @route GET /api/inventory
 * @returns {array} 200 - Array of inventory items.
 * @returns {string} 500 - Server error.
 */
app.get('/api/inventory', async (req, res) => 
  {
    try
    {
      const result = await pool.query('SELECT ingredient, unit, quantity, vendor, lastshipment, minimumquantity FROM inventory;');
      res.json(result.rows);
    }
    catch (err)
    {
      console.error('Error fetching iventory:', err.stack);
      res.status(500).send('Server Error');
    }
  }
);


/**
 * Endpoint to retrieve all menu items.
 * @route GET /api/menuitems
 * @returns {array} 200 - Array of menu items.
 * @returns {string} 500 - Server error.
 */
app.get('/api/menuitems', async (req, res) => 
  {
    try 
    {
      const result = await pool.query('SELECT * FROM menuItems ORDER BY menuitemid ASC;');
      res.json(result.rows);
    } 
    catch (error) 
    {
      console.error('Error fetching menu items:', error.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

/**
 * Endpoint to retrieve all menu items for the table.
 * @route GET /api/menuitemsTable
 * @returns {array} 200 - Array of menu items.
 * @returns {string} 500 - Server error.
 */
app.get('/api/menuitemsTable', async (req, res) => 
  {
    try 
    {
      const result = await pool.query('SELECT menuItemId, menuItem, price, size FROM menuItems ORDER BY menuitemid ASC;');
      res.json(result.rows);
    } 
    catch (error) 
    {
      console.error('Error fetching menu items:', error.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

/**
 * Endpoint to retrieve order history.
 * @route GET /api/orderHistory
 * @returns {array} 200 - Array of recent orders (up to 1000).
 * @returns {string} 500 - Server error.
 */
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


/**
 * Endpoint to get the restock report for inventory.
 * @route GET /api/restockReport
 * @returns {array} 200 - Array of ingredients needing restock, with quantity and minimum quantity.
 * @returns {string} 500 - Server error.
 */ 
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


/**
 * Endpoint to restock a specific inventory item.
 * @route GET /api/restockInventory
 * @param {string} ingredientName - The name of the ingredient to restock.
 * @returns {string} 200 - Success message about restocking.
 * @returns {string} 400 - Missing ingredient name in the request.
 * @returns {string} 404 - Ingredient not found in inventory.
 * @returns {string} 500 - Server error.
 */
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


/**
 * Handle user login.
 * @route POST /api/login
 * @param {string} username - Employee ID.
 * @param {string} password - Employee password.
 * @returns {object} 200 - Login status and position.
 * @returns {string} 500 - Server error.
 */
app.post('/api/login', async (req, res) =>
  {
    const {username, password} = req.body;
    try
    {
      userQuery = "SELECT * FROM employees WHERE employeeid = " + username;
      const result = await pool.query(userQuery);  

    if (result.rows.length === 0) {
        return res.json({ status: false, position: null });
    }

    const user = result.rows[0];

    if (user.password !== password || !user.status) { 
        return res.json({ status: false, position: null });
    }

    return res.json({ status: true, position: user.position });
    }
    catch (err)
    {
      console.error('Error during login:', err.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

/**
 * Handle user login.
 * @route POST /api/employee/login
 * @param {string} name - Employee Name
 * @returns {object} 200 - Login status and position.
 * @returns {string} 500 - Server error.
 */
app.post('/api/employee/login', async (req, res) =>
  {
    const {name} = req.body;
    try
    {
      const userQuery = "SELECT * FROM employees WHERE name = $1";
      const result = await pool.query(userQuery, [name]);

    if (result.rows.length === 0) {
        return res.json({ status: false, position: null });
    }

    const user = result.rows[0];

    if (!user.status) { 
        return res.json({ status: false, position: null });
    }

    return res.json({ status: true, position: user.position });
    }
    catch (err)
    {
      console.error('Error during login:', err.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);


/**
 * Enpoint to get the sales report for a date range.
 * @route GET /api/salesReport
 * @param {string} startDate - The start date (ISO format).
 * @param {string} endDate - The end date (ISO format).
 * @returns {array} 200 - Sales report data with menu items, total sales, and units sold.
 * @returns {string} 400 - Missing start or end date.
 * @returns {string} 404 - No sales data found for the given dates.
 * @returns {string} 500 - Server error.
 */
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


/**
 * Endpoint to update order history and order items.
 * @route POST /api/updateorders
 * @param {number} totalCost - Total cost of the order.
 * @param {array} menuItemIDs - Array of menu item IDs for the order.
 * @returns {string} 200 - Success message.
 * @returns {string} 500 - Server error.
 */
app.post('/api/updateorders', async (req, res) => {
  const { totalCost, menuItemIDs } = req.body;

  const itemCountMap = {};

  menuItemIDs.forEach(menuItemID => {
      itemCountMap[menuItemID] = (itemCountMap[menuItemID] || 0) + 1;
  });

  const client = await pool.connect();

  try
  {
      await client.query('BEGIN');

      // Get the current UTC time
      const currentUtcDate = new Date().toISOString(); // This returns the date in UTC

      const orderHistoryResult = await client.query(
          'INSERT INTO orderhistory (totalCost, date) VALUES ($1, $2) RETURNING orderid',
          [totalCost, currentUtcDate]
      );

      const newOrderID = orderHistoryResult.rows[0].orderid;

      for (const menuItemID in itemCountMap) {
          const quantity = itemCountMap[menuItemID];
          await client.query(
              'INSERT INTO orderitems (orderid, menuitemid, quantity) VALUES ($1, $2, $3)',
              [newOrderID, parseInt(menuItemID), quantity]
          );
      }

      await client.query('COMMIT');
      res.status(200).json({ message: 'Order updated successfully!' });
  } catch (error) {
      console.error('Error updating order:', error);
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'Failed to update order' });
  } finally {
      client.release();
  }
});



/**
 * Endpoint to update inventory based on menu item usage.
 * @route POST /api/updateinventory
 * @param {array} menuItemIDs - Array of menu item IDs.
 * @returns {string} 200 - Success message.
 * @returns {string} 400 - Missing menu item IDs in the request.
 * @returns {string} 500 - Server error.
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


// 
/**
 * Endpoint to update the pending orders table
 * @route POST /api/updatependingorders
 * @param {number} totalCost - The total cost of the order.
 * @param {Array} menuItemIDs - Array of menu item IDs for the order.
 * @param {string} inputName - The name of the customer placing the order.
 * @returns {Object} 200 - Success message with the newly created order ID.
 * @returns {Object} 400 - Error if any required input is missing or invalid.
 * @returns {Object} 500 - Error if there's a server failure.
 */
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


// 
/**
 * Endpoint to get all pending orders from the database.
 * @route GET /api/getpendingorders
 * @returns {Object} 200 - A list of all pending orders.
 * @returns {Object} 500 - Error if there's a server failure.
 */
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


/**
 * Endpoint to get the display name of a menu item using its ID.
 * @route GET /api/getdisplayname
 * @param {string} menuitemID - The ID of the menu item.
 * @returns {string} 200 - The display name of the menu item.
 * @returns {Object} 400 - Error if the menu item ID is missing.
 * @returns {Object} 404 - Error if the menu item is not found.
 * @returns {Object} 500 - Error if there's a server failure.
 */
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


/**
 * Endpoint to delete a pending order from the database by ID.
 * @route DELETE /api/deletependingorder/:id
 * @param {string} id - The ID of the pending order to delete.
 * @returns {Object} 200 - Success message indicating the order was deleted.
 * @returns {Object} 500 - Error if deletion fails.
 */
app.delete('/api/deletependingorder/:id', async (req, res) => {
  const { id } = req.params;
  try {
      await pool.query('DELETE FROM pendingorders WHERE pendingorderid = $1', [id]);
      res.status(200).send({ message: `Pending order ${id} deleted successfully.` });
  } catch (error) {
      console.error('Error deleting pending order:', error);
      res.status(500).send({ error: 'Failed to delete pending order.' });
  }
});




//######################################################################  FEATURES ENDPOINTS  #######################################################################


/**
 * Fetches the sales data for the X report based on the latest Z report date.
 * @route {GET} /api/xReport
 * @returns {Object[]} - An array of sales data objects:
 *    - Each object contains `hour` (time in adjusted format) and `total_sum` (total sales for that hour).
 *    - The last object is a summary row with the `hour` set to "Total" and `total_sum` showing the total sales.
 */

app.get('/api/xReport', async (req, res) => {
  try {
    const latestReportResult = await pool.query(
      'SELECT created_at FROM z_reports ORDER BY created_at DESC LIMIT 1'
    );

    if (latestReportResult.rows.length === 0) {
      return res.status(404).json({ error: 'No Z reports found' });
    }

    const latestReportDate = latestReportResult.rows[0].created_at;

    const startDate = moment(latestReportDate).format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment().format('YYYY-MM-DD HH:mm:ss');

    const client = await pool.connect();
    const resultQuery = await client.query(
      'SELECT EXTRACT(HOUR FROM date) AS hour, SUM(totalcost) AS total_sum ' +
      'FROM orderhistory ' +
      'WHERE date >= $1 AND date <= $2 ' +
      'GROUP BY hour ' +  
      'ORDER BY hour',
      [startDate, endDate]
    );

    const totalSum = resultQuery.rows.reduce((acc, row) => acc + (row.total_sum || 0), 0);

    const groupedRows = resultQuery.rows.reduce((acc, row) => {
      const hourFormatted = moment({ hour: row.hour }).subtract(6, 'hours').format('h A'); 

      if (!acc[hourFormatted]) {
        acc[hourFormatted] = 0;
      }

      acc[hourFormatted] += row.total_sum;  
      return acc;
    }, {});

    const formattedRows = Object.keys(groupedRows).sort((a, b) => moment(a, 'h A').isBefore(moment(b, 'h A')) ? -1 : 1)
      .map(hour => ({
        hour,
        total_sum: parseFloat(groupedRows[hour].toFixed(2))  
      }));


    formattedRows.push({
      hour: 'Total',
      total_sum: parseFloat(totalSum.toFixed(2))  
    });

    res.json(formattedRows);
  } catch (error) {
    console.error("Error fetching x report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }  
});


/**
 * Creates a new Z report in the database.
 * This function inserts a new record into the `z_reports` table with the current timestamp.
 * The `created_at` column is automatically populated with the current date and time by the database.
 * 
 * 
 * @route {POST} /api/zReport
 * @returns {Object} - A JSON object with a message indicating success or failure:
 *    - On success: { message: 'Z Report created successfully' }
 *    - On failure: { error: 'Internal server error' }
 */
app.post('/api/zReport', async (req, res) => {
  try {
    await pool.query('INSERT INTO z_reports DEFAULT VALUES');

    res.status(201).json({ message: 'Z Report created successfully' });
  } catch (error) {
    console.error('Error creating Z report:', error);
    res.status(500).json({ error: 'Internal server error' });
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


/**
 * Endpoint to retrieve product usage data for an ingredient based on timeframe (hourly, daily, monthly).
 * @route GET /api/product-usage
 * @param {string} ingredient - The name of the ingredient to retrieve usage data for.
 * @param {string} timeframe - The timeframe for data retrieval ('hourly', 'daily', 'monthly').
 * @param {string} year - The year (for 'monthly' timeframe).
 * @param {string} month - The month (for 'daily' timeframe).
 * @param {string} day - The day (for 'hourly' timeframe).
 * @returns {Object} 200 - Success response with usage data.
 * @returns {Object} 400 - Error if invalid timeframe or missing data.
 * @returns {Object} 404 - Error if ingredient not found.
 * @returns {Object} 500 - Error if fetching usage data fails.
 */
app.get('/api/product-usage', async (req, res) =>
{
  const { ingredient, timeframe, year, month, day } = req.query;

  // Validate ingredient presence
  if (!ingredient)
  {
    return res.status(400).json({ message: 'Ingredient is required.' });
  }

  const client = await pool.connect(); // Establish database connection

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
             ROUND(ABS(SUM(order_items.quantity * menu_ing.quantity))::numeric, 2) AS total_usage,
             TO_CHAR(DATE_TRUNC('${dateTrunc}', oh.date), '${dateFormat}') AS time_period
      FROM orderhistory oh
      JOIN orderitems order_items ON oh.orderid = order_items.orderid
      JOIN menuitemingredients menu_ing ON order_items.menuitemid = menu_ing.menuitemid
      JOIN inventory inv ON menu_ing.ingredient = inv.ingredient
      WHERE LOWER(inv.ingredient) = $1
      ${dateFilter}
      GROUP BY inv.ingredient, time_period
      ORDER BY time_period;
    `;

    console.log('Executing query:', query); // For debugging

    // Execute the query
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
});


/**
 * Endpoint to add a seasonal item to the menu with ingredients and quantities.
 * @route POST /api/addseasonalitem
 * @param {string} itemName - The name of the seasonal item to add.
 * @param {Array<string>} itemIngredients - List of ingredients required for the seasonal item.
 * @param {Array<number>} quantities - Corresponding quantities for each ingredient.
 * @param {Array<number>} prices - Array of floats representing prices for ['sm', 'md', 'lg'] sizes.
 * @param {string} displayname - Display name of the seasonal item.
 * @param {string} type - The type of menu item (e.g., 'entree').
 * @returns {Object} 201 - Success message indicating the item was added successfully.
 * @returns {Object} 400 - Error if missing fields or mismatched arrays.
 * @returns {Object} 500 - Error if adding seasonal item fails.
 */
app.post('/api/addseasonalitem', async (req, res) =>
{
  const { itemName, itemIngredients, quantities, prices, displayname, type } = req.body;

  // Validate input
  if (!itemName || !itemIngredients || !quantities || !displayname || !type)
  {
    return res.status(400).json({ error: 'All fields (itemName, itemIngredients, quantities, displayname, and type) are required.' });
  }

  if (itemIngredients.length !== quantities.length)
  {
    return res.status(400).json({ error: 'itemIngredients and quantities arrays must have the same length.' });
  }

  if (!Array.isArray(prices) || prices.length !== 3)
  {
    return res.status(400).json({ error: 'Prices must be an array of exactly 3 floats corresponding to sizes [\'sm\', \'md\', \'lg\'].' });
  }

  const client = await pool.connect(); // Get a connection from the database pool

  try
  {
    await client.query('BEGIN'); // Start a database transaction

    // Define sizes and prices
    const sizes = ['sm', 'md', 'lg'];
    // const prices = [6.7, 11.5, 15.7];

    // Insert into menuitems
    const menuItemInsertQuery = `
      INSERT INTO menuitems (menuitem, price, size, status, type, displayname)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING menuitemid;
    `;

    const menuitemIds = [];
    for (let i = 0; i < sizes.length; i++)
    {
      const values = [itemName, prices[i], sizes[i], 'active', type, displayname];

      const result = await client.query(menuItemInsertQuery, values);

      menuitemIds.push(result.rows[0].menuitemid);
    }

    // Insert ingredients for each menuitem ID
    const ingredientInsertQuery = `
    INSERT INTO menuitemingredients (menuitemid, ingredient, quantity)
    VALUES ($1, $2, $3);
    `;

    for (const menuitemId of menuitemIds)
    {
      for (let i = 0; i < itemIngredients.length; i++)
      {
        const ingredientValues = [menuitemId, itemIngredients[i], quantities[i]];

        await client.query(ingredientInsertQuery, ingredientValues);
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    res.status(201).json({ message: 'Seasonal item added/activated successfully!', menuitemIds });

  }
  catch (error)
  {
    // Rollback transaction on error
    await client.query('ROLLBACK');

    console.error('Error adding/activating seasonal item:', error);

    res.status(500).json({ error: error.message || 'Internal Server Error' });

  } 
  finally
  {
    // Release database connection
    client.release();
  }

});


/**
 * Endpoint to remove or deactivate a seasonal item from the menu.
 * @route POST /api/removeseasonalitem
 * @param {string} itemName - The name of the seasonal item to deactivate.
 * @returns {Object} 200 - Success message indicating the seasonal item was deactivated.
 * @returns {Object} 400 - Error if itemName is missing.
 * @returns {Object} 404 - Error if item not found or already inactive.
 * @returns {Object} 500 - Error if deactivating seasonal item fails.
 */
app.post('/api/removeseasonalitem', async (req, res) =>
{
  const { itemName } = req.body;

  // Validate input
  if (!itemName)
  {
    return res.status(400).json({ error: 'itemName is required.' });
  }

  const client = await pool.connect(); // Get a database connection

  try
  {
    await client.query('BEGIN'); // Start transaction

    // Update the status of the menu items to 'inactive'
    const updateQuery = `
      UPDATE menuitems
      SET status = 'inactive'
      WHERE menuitem = $1 AND status = 'active';
    `;

    const result = await client.query(updateQuery, [itemName]);

    // Check if any rows were updated
    if (result.rowCount === 0)
    {
      return res.status(404).json({ error: 'Item not found or already inactive.' });
    }

    await client.query('COMMIT'); // Commit transaction
    res.status(200).json({ message: `Seasonal item '${itemName}' successfully Deactivated.` });

  }
  catch (error)
  {
    await client.query('ROLLBACK'); // Rollback on error

    console.error('Error Deactivating seasonal item:', error);

    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
  finally
  {
    client.release(); // Release database connection
  }
});


/**
 * Endpoint to retrieve all active seasonal items.
 * @route GET /api/getactiveseasonalitems
 * @returns {Array<Object>} 200 - List of active seasonal items with details (menuitem, price, size, type, displayname).
 * @returns {Object} 500 - Error if fetching active seasonal items fails.
 */
app.get('/api/seasonalItems', async (req, res) =>
{
  try
  {
    // Query to get active seasonal items from the database
    const result = await pool.query(`
      SELECT menuitem, price, size, type, status, displayname
      FROM menuitems
      WHERE status = 'active'
      ORDER BY menuitemid;
    `);

    res.json(result.rows);
  }
  catch(error)
  {
    console.error('Error fetching active seasonal items:', error.stack);
    res.status(500).json({ error: 'Server Error' });
  }
});


/**
 * Endpoint to create a new rewards account.
 * @route POST /api/addrewardsaccount
 * @param {string} name - The name of the user.
 * @param {string} email - The email address of the user.
 * @param {number} points - The points to be assigned to the user.
 * @returns {Object} 201 - Success message with the created user's details.
 * @returns {Object} 400 - Error if required fields are missing.
 * @returns {Object} 409 - Error if email already exists in the database.
 * @returns {Object} 500 - Error if creating the rewards account fails.
 */
app.post('/api/addrewardsaccount', async (req, res) =>
{
  const { name, email, points } = req.body;

  if (!name || !email || points === undefined)
  {
    return res.status(400).json({ error: 'Missing required fields (name, email, points)' });
  }

  const client = await pool.connect(); // Get a database connection

  try
  {
    await client.query('BEGIN'); // Start transaction

    // Check if email already exists in the rewards table
    const checkUser = await client.query('SELECT * FROM rewards WHERE email = $1', [email]);

    if (checkUser.rows.length > 0)
    {
      await client.query('ROLLBACK'); // Rollback on conflict (email already exists)
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Insert new rewards account
    const result = await client.query
    (
      'INSERT INTO rewards (name, email, points) VALUES ($1, $2, $3) RETURNING *',
      [name, email, points]
    );

    await client.query('COMMIT'); // Commit transaction

    // Return the newly created user
    res.status(201).json
    ({
      message: 'Rewards account created successfully',
      user: result.rows[0],
    });
  }
  catch(error)
  {
    await client.query('ROLLBACK'); // Rollback on error

    console.error('Error Creating Rewards Account:', error);

    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
  finally
  {
    client.release(); // Release database connection
  }
});


/**
 * Endpoint to add points to a user's rewards account.
 * @route POST /api/addpoints
 * @param {string} email - The email address of the user.
 * @param {number} points - The points to be added to the user's account.
 * @returns {Object} 200 - Success message with the updated user's details.
 * @returns {Object} 400 - Error if email or points are missing or invalid.
 * @returns {Object} 404 - Error if the user is not found.
 * @returns {Object} 500 - Error if adding points fails.
 */
app.post('/api/addpoints', async (req, res) => {
  const { email, points } = req.body;

  // Validate email and points
  if (!email || email.trim() === '') {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (points === undefined || points <= 0) {
    return res.status(400).json({ error: 'Invalid points to add' });
  }

  console.log('Received email:', email);
  console.log('Points to add:', points);

  const client = await pool.connect(); // Get a database connection

  try {
    await client.query('BEGIN'); // Start transaction

    const userResult = await client.query(
      'SELECT * FROM rewards WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.warn('User not found for email:', email);
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    const currentPoints = userResult.rows[0].points;
    const updatedPoints = currentPoints + points;

    const updateResult = await client.query(
      'UPDATE rewards SET points = $1 WHERE LOWER(email) = LOWER($2) RETURNING *',
      [updatedPoints, email]
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Points added successfully',
      user: updateResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error Adding Points in the Rewards Table:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  } finally {
    client.release();
  }
});



/**
 * Endpoint to check if a rewards account exists for a given email.
 * @route GET /api/checkaccount
 * @param {string} email - The email address to check.
 * @returns {Object} 200 - Success message with an indicator if the account exists.
 * @returns {Object} 400 - Error if the email is missing.
 * @returns {Object} 404 - Error if no account is found for the given email.
 * @returns {Object} 500 - Error if checking the account fails.
 */
app.get('/api/checkaccount', async (req, res) =>
{
  const { email } = req.query;  // Get email from query parameters

  if (!email)
  {
    return res.status(400).json({ error: 'Email is required' });
  }

  const client = await pool.connect(); // Get a database connection

  try
  {
    // Check if the user exists in the rewards table
    const userResult = await client.query('SELECT * FROM rewards WHERE email = $1', [email]);

    if (userResult.rows.length > 0) // Account exists
    {
      return res.status(200).json({ exists: true });
    }
    else // Account does not exist
    {
      return res.status(404).json({ exists: false, message: 'User not found' });
    }
  }
  catch (error)
  {
    console.error('Error Checking Rewards Account:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
  finally
  {
    client.release(); // Release database connection
  }

});


/**
 * Endpoint to retrieve the user details for a given email.
 * @route GET /api/getuserdetails
 * @param {string} email - The email address of the user whose details are to be fetched.
 * @returns {Object} 200 - User's name and points.
 * @returns {Object} 400 - Error if email is missing.
 * @returns {Object} 404 - Error if no user is found for the provided email.
 * @returns {Object} 500 - Error if fetching user details fails.
 */
app.get('/api/getuserdetails', async (req, res) => {
  const { email } = req.query;

  if (!email) {
      return res.status(400).json({ error: 'Email is required' });
  }

  try {
      const client = await pool.connect();
      const userQuery = await client.query('SELECT name, points FROM rewards WHERE email = $1', [email]);

      if (userQuery.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      const user = userQuery.rows[0];
      res.status(200).json(user);
  } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * Endpoint to change the price of a menu item by ID.
 * @route POST /api/changePrice
 * @param {number} menuItemID - The ID of the menu item to change the price of.
 * @param {number} newPrice - The new price for the menu item.
 * @returns {Object} 200 - Success message with updated item details.
 * @returns {Object} 400 - Error if invalid data is provided.
 * @returns {Object} 404 - Error if menu item not found.
 * @returns {Object} 500 - Error if price change fails.
 */
app.post('/api/changePrice', async (req, res) => {
  let { menuItemID, newPrice } = req.body;
  if (!menuItemID || !newPrice) {
    return res.status(400).json({ error: 'Invalid data' });
  }
  try {
    const result = await pool.query('UPDATE menuitems SET price = $1 WHERE menuitemid = $2 RETURNING *;', [newPrice, menuItemID]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    menuItemID = parseInt(menuItemID, 10);
    newPrice = parseFloat(newPrice);
    res.json({ message: `Price updated successfully for item ${menuItemID}`, item: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'An error occurred while updating the price' });
  }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
////////////////////////////////////////////                           FILE DOWNLOAD                               //////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




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


/**
 * Endpoint to download the menu items in JSON format.
 * @route GET /download-menu
 * @returns {Object} 200 - Success message with file path of the saved JSON file.
 * @returns {Object} 500 - Error if downloading the file fails.
 */
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




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
////////////////////////////////////////////                START LISTENING FOR API CALLS                          //////////////////////////////////////////////////
////////////////////////////////////////////                                                                       //////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/** This piece of code need to be in end o ensure all routes and middleware are set up before the server starts listening for requests.
 * 
 * Its purpose is to start the Express server and tells it to listen of incoming HTTP requests on a specific port 
*/

// Start the server
app.listen(port, '0.0.0.0', async () => {
  console.log(`Server is running on port ${port}`);
});
