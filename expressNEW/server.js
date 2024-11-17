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
      const result = await pool.query('SELECT * FROM orderhistory;');  
      res.json(result.rows); 
    }
    catch (err)
    {
      console.error('Error fetching orderhistory:', err.stack);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);


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
    finally
    {
      client.release();
    }
  }
);




//######################################################################  FEATURES ENDPOINTS  ########################################################################

//endpoint to get x report 
app.get('/api/xReport', async (req, res) =>
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
