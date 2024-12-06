/**
 * Creates a Google Translate Element for page translation
 */
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: "en" },
        "googleTranslateElement"
    )
}

/**
 * Toggles the view between employee table and form.
 */
function toggleView() {
    const table = document.getElementById('employeeTable');
    const form = document.getElementById('employeeForm');
    const button = document.getElementById('toggleButton');

    if (table.style.display === 'none') {
        table.style.display = 'block';
        form.style.display = 'none';
        button.textContent = 'Manage Employees';
    } else {
        table.style.display = 'none';
        form.style.display = 'block';
        button.textContent = 'View Employees';
    }
}

/**
 * Toggles the view between the inventory table and form
 */
function toggleViewInventory() {
    var table = document.getElementById("inventoryTable");
    var form = document.getElementById("inventoryForm");
    const button = document.getElementById('toggleButtonInventory');

    if (form.style.display === "none") {
        form.style.display = "block";
        table.style.display = "none";
        button.textContent = 'Manage Inventory';

    } else {
        form.style.display = "none";
        table.style.display = "block";
        button.textContent = 'View Inventory';

    }
}

/**
 * Endpoint to add a new ingredient to the inventory.
 * @route POST /api/addIngredient
 * @param {string} name - Ingredient's name.
 * @param {string} unit - Ingredient's unit (e.g., kg, liters).
 * @param {string} quantity - Quantity of the ingredient.
 * @param {string} vendor - Vendor name for the ingredient.
 * @param {string} lastShipmentDate - Date when the ingredient was last shipped.
 * @param {string} minQuantity - Minimum quantity threshold for restocking.
 * @returns {object} 201 - Ingredient added successfully with the new ingredient's data.
 * @returns {object} 400 - Missing required fields.
 * @returns {object} 500 - Error adding ingredient.
 */
async function addIngredient() {
    const name = document.getElementById('ingredientName').value;
    const unit = document.getElementById('ingredientUnit').value;
    const quantity = document.getElementById('ingredientQuantity').value;
    const vendor = document.getElementById('ingredientVendor').value;
    const lastShipmentDate = document.getElementById('ingredientDate').value;
    const minQuantity = document.getElementById('ingredientMinQty').value;

    if (!name || !unit || !quantity || !vendor || !lastShipmentDate || !minQuantity) {
        alert("Please fill in all fields.");
        return;
    }

    const ingredientData = { name, unit, quantity, vendor, lastShipmentDate, minQuantity };

    try {
        const response = await fetch('/api/addIngredient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ingredientData),
        });

        const data = await response.json();
        if (response.status === 201) {
            alert(`Ingredient added successfully: ${data.ingredient.name}`);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error adding ingredient:', error);
        alert('There was an error adding the ingredient.');
    }
}

/**
 * Endpoint to delete an ingredient from the inventory.
 * @route DELETE /api/deleteIngredient/{ingredientName}
 * @param {string} ingredientName - The name of the ingredient to delete.
 * @returns {object} 200 - Ingredient deleted successfully.
 * @returns {object} 400 - Ingredient not found.
 * @returns {object} 500 - Error deleting ingredient.
 */
async function deleteIngredient() {
    const ingredientName = document.getElementById('deleteIngredientId').value;

    if (!ingredientName) {
        alert("Please enter the ingredient name to delete.");
        return;
    }

    try {
        const response = await fetch(`/api/deleteIngredient/${ingredientName}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        if (response.status === 200) {
            alert(`Ingredient with name ${ingredientName} deleted successfully.`);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting ingredient:', error);
        alert('There was an error deleting the ingredient.');
    }
}

/**
 * Endpoint to update an ingredient's details in the inventory.
 * @route PUT /api/updateIngredient/{ingredientName}
 * @param {string} ingredientName - The name of the ingredient to update.
 * @param {string} field - The field to update (e.g., 'quantity', 'vendor').
 * @param {string} value - The new value for the field.
 * @returns {object} 200 - Ingredient updated successfully.
 * @returns {object} 400 - Invalid field or value.
 * @returns {object} 500 - Error updating ingredient.
 */
async function updateIngredient() {
    const ingredientName = document.getElementById('updateIngredientId').value;
    const field = document.getElementById('updateFieldIngredient').value;
    const value = document.getElementById('updateValueIngredient').value;

    if (!ingredientName || !field || !value) {
        alert("Please fill in all fields.");
        return;
    }

    const updateData = { field, value };

    try {
        const response = await fetch(`/api/updateIngredient/${ingredientName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        const data = await response.json();
        if (response.status === 200) {
            alert(`Ingredient with name ${ingredientName} updated successfully.`);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error updating ingredient:', error);
        alert('There was an error updating the ingredient.');
    }
}


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
async function createEmployee() {
    const name = document.getElementById('employeeName').value;
    const id = document.getElementById('employeeId').value;
    const password = document.getElementById('employeePassword').value;
    const status = document.getElementById('employeeStatus').value;
    const phone = document.getElementById('employeePhone').value;
    const position = document.getElementById('employeePosition').value;

    if (!name || !id || !password || !status || !phone || !position) {
        alert("Please fill in all fields.");
        return;
    }

    const employeeData = { name, id, password, status, phone, position };

    try {
        const response = await fetch('/api/createEmployee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });

        const data = await response.json();
        if (response.status === 201) {
            alert(`Employee created successfully: ${data.employee.name}`);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error creating employee:', error);
        alert('There was an error creating the employee.');
    }
}

/**
 * Endpoint to delete an employee from the system.
 * @route DELETE /api/deleteEmployee/{employeeId}
 * @param {string} employeeId - The ID of the employee to delete.
 * @returns {object} 200 - Employee deleted successfully.
 * @returns {object} 400 - Employee not found.
 * @returns {object} 500 - Error deleting employee.
 */
async function deleteEmployee() {
    const employeeId = document.getElementById('deleteEmployeeId').value;

    if (!employeeId) {
        alert("Please enter the employee ID to delete.");
        return;
    }

    try {
        const response = await fetch(`/api/deleteEmployee/${employeeId}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        if (response.status === 200) {
            alert(`Employee with ID ${employeeId} deleted successfully.`);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        alert('There was an error deleting the employee.');
    }
}
/**
 * Endpoint to update an employee's information.
 * @route PUT /api/updateEmployee/{employeeId}
 * @param {string} employeeId - The ID of the employee to update.
 * @param {object} updateData - The fields and values to update for the employee.
 * @param {string} updateData.field - The field to update (e.g., 'name', 'position').
 * @param {string} updateData.value - The new value for the field.
 * @returns {object} 200 - Employee updated successfully.
 * @returns {object} 400 - Missing or invalid input.
 * @returns {object} 500 - Error updating employee.
 */
async function updateEmployee() {
    const employeeId = document.getElementById('updateEmployeeId').value;
    const field = document.getElementById('updateField').value;
    const value = document.getElementById('updateValue').value;

    if (!employeeId || !field || !value) {
        alert("Please fill in all fields.");
        return;
    }

    const updateData = { field, value };

    try {
        const response = await fetch(`/api/updateEmployee/${employeeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        const data = await response.json();
        if (response.status === 200) {
            alert(`Employee with ID ${employeeId} updated successfully.`);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        alert('There was an error updating the employee.');
    }
}

/**
 * Deletes an order based on the provided order ID.
 * @route DELETE /api/orders/{orderId}
 * @param {string} orderId - The ID of the order to delete.
 * @returns {object} 200 - Order deleted successfully.
 * @returns {object} 400 - Invalid order ID or order not found.
 * @returns {object} 500 - Error deleting the order.
 */
async function deleteOrder() {
    const orderId = document.getElementById('deleteOrderId').value.trim();

    if (!orderId) {
        alert('Please enter a valid Order ID.');
        return;
    }

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error deleting order:', error);
        alert('An error occurred while deleting the order.');
    }
}
/**
 * Updates the field type based on the input
 */
function updateTimeframeInputs() {
    const timeframe = document.getElementById('timeframe').value;
    const dateInput = document.getElementById('dateInput');

    if (timeframe === 'hourly') {
        dateInput.placeholder = 'Enter date (YYYY-MM-DD)';
        dateInput.type = 'date'; 
    } else if (timeframe === 'daily') {
        dateInput.placeholder = 'Enter month (YYYY-MM)';
        dateInput.type = 'month'; 
    } else if (timeframe === 'monthly') {
        dateInput.placeholder = 'Enter year (YYYY)';
        dateInput.type = 'number'; 
    }
}

/**
 * Function to handle product usage query and display the results in a table format.
 * @returns {void}
 */
async function getProductUsage() {
        const ingredient = document.getElementById('ingredient').value;
        const timeframe = document.getElementById('timeframe').value;
        const dateInput = document.getElementById('dateInput').value;
        let url = `/api/product-usage?ingredient=${ingredient}&timeframe=${timeframe}`;

        if (!dateInput) {
            alert("Please provide a valid date.");
            return;
        }

        if (timeframe === 'hourly') {
            url += `&day=${dateInput}`;
        } else if (timeframe === 'daily') {
            url += `&month=${dateInput}`;
        } else if (timeframe === 'monthly') {
            url += `&year=${dateInput}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                query = "#product-usage"; 

                let tableBody = document.querySelector(`#${tableID} tbody`);
                let table = document.querySelector(`#${tableID}`);
                
                if (!tableBody) {
                    tableBody = document.createElement('tbody');
                    table.appendChild(tableBody);
                }
            
                while (tableBody.firstChild) {
                    tableBody.removeChild(tableBody.firstChild);
                }
                

                data.forEach(row => {
                    const tableRow = document.createElement('tr');
                    Object.values(row).forEach(value => {
                        const cell = document.createElement('td');
                        cell.textContent = value;
                        tableRow.appendChild(cell);
                    });
                    tableBody.appendChild(tableRow);
                });

            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('An error occurred while fetching the product usage data.');
    }
}


/**
 * Gets data from API endpoint and populates the table with the  data.
 * @param APIEndpoint the API endpoint URL to get data from
 * @param tableID the ID of the table to be populated 
 * @throws {Error} if the fetch request fails or if the JSON response cannot be parsed
 */
async function populateTable(APIEndpoint, tableID) {
    const response = await fetch(APIEndpoint);
    const data = await response.json();
    query = '#' + tableID; 

    let tableBody = document.querySelector(`#${tableID} tbody`);
    let table = document.querySelector(`#${tableID}`);
    
    if (!tableBody) {
        tableBody = document.createElement('tbody');
        table.appendChild(tableBody);
    }

    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }

    data.forEach(row => {
        const tableRow = document.createElement('tr');
        Object.values(row).forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            tableRow.appendChild(cell);
        });
        tableBody.appendChild(tableRow);
    });
}

/**
 * Fetches and populates the sales report based on a date range.
 * @route GET /api/salesReport
 * @param {string} startDate - The start date for the sales report in YYYY-MM-DD format.
 * @param {string} endDate - The end date for the sales report in YYYY-MM-DD format.
 * @returns {array} 200 - Sales report data for the specified date range.
 * @returns {object} 400 - Invalid date range or missing parameters.
 * @returns {object} 500 - Error fetching the sales report.
 */
async function populateSales() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates.');
        return;
    }   

    try {
        const response = await fetch(`/api/salesReport?startDate=${startDate}&endDate=${endDate}`);
        const data = await response.json();

        query = "#salesReport"; 

        let tableBody = document.querySelector(`#${tableID} tbody`);
        let table = document.querySelector(`#${tableID}`);
        
        if (!tableBody) {
            tableBody = document.createElement('tbody');
            table.appendChild(tableBody);
        }
    
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        


        data.forEach(row => {
            const tableRow = document.createElement('tr');
            Object.values(row).forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                tableRow.appendChild(cell);
            });
            tableBody.appendChild(tableRow);
        });
        
    }
    catch (error) {
        console.error('Error fetching sales report:', error);
    }
}

/**
 * Populates a table with sales data from the X report API and optionally inserts a new Z report.
 * @param {string} APIEndpoint - The API endpoint used for additional actions. If the endpoint is "/api/zReport", a new Z report will be inserted.
 * @param {string} tableID - The ID of the table element to populate with sales data.
 * 
 * @returns {void}
 */
async function populateReports(APIEndpoint, tableID) {
    const salesResponse = await fetch('/api/xReport');
    if (!salesResponse.ok) {
        alert("Failed to fetch sales data.");
        return;
    }

    const salesData = await salesResponse.json();

    let tableBody = document.querySelector(`#${tableID} tbody`);
    let table = document.querySelector(`#${tableID}`);
    
    if (!tableBody) {
        tableBody = document.createElement('tbody');
        table.appendChild(tableBody);
    }

    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }

    salesData.forEach(row => {
        const tableRow = document.createElement('tr');
        Object.values(row).forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            tableRow.appendChild(cell);
        });
        tableBody.appendChild(tableRow);
    });

    if (APIEndpoint === "/api/zReport") {
        try {
            const zReportInsertResponse = await fetch('/api/zReport', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                })
            });
            if (!zReportInsertResponse.ok) {
                alert("Failed to insert a new Z report.");
            }
        } catch (error) {
            console.error("Error inserting Z report:", error);
            alert("An error occurred while inserting a new Z report.");
        }
    }
}

/**
 * Sets up the tab functionality and populates each tab with appropritate data.
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.tabLinks');
    const contents = document.querySelectorAll('.tabContent');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
           
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(content => content.style.display = 'none');

            
            tab.classList.add('active');
            contents[index].style.display = 'block';

            const activeTable = contents[index].querySelector('table');
            const tableID = activeTable.id;
            const APIEndpoint = "/api/" + tableID;

            if (APIEndpoint == "/api/xReport" || APIEndpoint == "/api/zReport") {
                populateReports(APIEndpoint, tableID);
            }
            else if (APIEndpoint == '/api/salesReport' | APIEndpoint == '/api/product-usage'){
                return;
            }
            else {
                populateTable(APIEndpoint, tableID);
            }
        });
    });


    tabs[0].classList.add('active');
    contents[0].style.display = 'block';

    const firstTable = contents[0].querySelector('table');
    const tableID = firstTable.id;
    const APIEndpoint = "/api/" + tableID;
    populateTable(APIEndpoint, tableID);
}


let reportDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',  
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).format(new Date());

window.onload = setupTabs;

/**
 * Allows for view control drop down to appear when needed.
 */
function toggleDropdown() {
    const dropdown = document.getElementById("dropdownMenu");
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}

window.onclick = function (event) {
    if (!event.target.matches('.dropdownButton')) {
        const dropdowns = document.getElementsByClassName("dropdownContent");
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].style.display = "none";
        }
    }
};

/**
 * Converts a string to camelCase.
 * @param str the string to be converted to camelCase
 * @return the camelCase formatted string
 */
function toCamelCase(str) {
    return str
        .toLowerCase() 
        .replace(/[^a-zA-Z0-9 ]/g, '') 
        .split(' ') 
        .map((word, index) => 
            index === 0
                ? word 
                : word.charAt(0).toUpperCase() + word.slice(1) 
        )
        .join(''); 
}

/**
 * Applies camelCase to the input of a field.
 * @param input the field whose input is to be converted to camelCase
 */
function enforceCamelCase(input) {
    input.value = toCamelCase(input.value);
}

async function changePrice() {
    let ID = document.getElementById('menuItemID').value;
    let price = document.getElementById('newPrice').value;
    if (!ID || !price) {
        alert("Please fill both required parts");
        return;
    }
    try  {
        const response = await fetch('/api/changePrice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                menuItemID: ID,
                newPrice: price
            }),
        });
        const data = await response.json();
        if (response.ok) {
            alert(`Success: ${data.message}`);
        } else {
            alert(`Error: ${data.error}`);
        }
    }
    catch (error) {
        console.error('Error changing price:', error);
        alert('An error occurred while trying to change the price.');
    }
}
async function restockIngredient() {
    const ingredientName = document.getElementById('restockIngredient').value;
    if (!ingredientName) {
        alert("Please provide an ingredient name.");
        return;
    }
    try {
        const response = await fetch(`/api/restockInventory?ingredientName=${ingredientName}`);
        const data = await response.json();
        if (response.ok) {
            alert(`Success: ${data.message}`);
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error restocking ingredient:', error);
        alert('An error occurred while trying to restock the ingredient.');
    }
}

function toggleViewSeasonal() {
    const table = document.getElementById("seasonalTable");
    const form = document.getElementById("seasonalForm");
    const button = document.getElementById("toggleButtonSeasonal");

    if (form.style.display === "none") {
        form.style.display = "block";
        table.style.display = "none";
        button.textContent = "View Seasonal Items";
    } else {
        form.style.display = "none";
        table.style.display = "block";
        button.textContent = "Manage Seasonal Items";
    }
}