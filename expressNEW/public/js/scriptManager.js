//Translation Functionality
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: "en" },
        "googleTranslateElement"
    )
}

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
                const tableBody = document.querySelector(query);
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

async function removeIngredient() {
    const ingredientName = document.getElementById('removeIngredient').value;
    const quantityToRemove = document.getElementById('removeQuantity').value;

    if (!ingredientName || !quantityToRemove || quantityToRemove <= 0) {
        alert("Please fill both required fields with valid data.");
        return;
    }

    try {
        const response = await fetch(`/api/removeStock?ingredientName=${ingredientName}&quantity=${quantityToRemove}`, {
            method: 'POST', 
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Success: ${data.message}`);
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error removing ingredient:', error);
        alert('An error occurred while trying to remove the ingredient.');
    }
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
        // Parse the response
        const data = await response.json();

        if (response.ok) {
            // Success message
            alert(`Success: ${data.message}`);
        } else {
            // Error message
            alert(`Error: ${data.error}`);
        }
    }

    catch (error) {
        console.error('Error changing price:', error);
        alert('An error occurred while trying to change the price.');
    }

}

async function restockIngredient() {
    // Get the ingredient name from a user input or specify it directly
    const ingredientName = document.getElementById('restockIngredient').value;

    if (!ingredientName) {
        alert("Please provide an ingredient name.");
        return;
    }

    try {
        // Make the API request to restock the ingredient
        const response = await fetch(`/api/restockInventory?ingredientName=${ingredientName}`);

        // Parse the response
        const data = await response.json();

        if (response.ok) {
            // Success message
            alert(`Success: ${data.message}`);
        } else {
            // Error message
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error('Error restocking ingredient:', error);
        alert('An error occurred while trying to restock the ingredient.');
    }
}

async function populateTable(APIEndpoint, tableID) {
    const response = await fetch(APIEndpoint);
    const data = await response.json();
    query = '#' + tableID; 
    const tableBody = document.querySelector(query);


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
        const tableBody = document.querySelector(query);


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

async function populateReports(APIEndpoint, tableID) {
    let currDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago', 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
    if (reportDate != currDate) {
        alert("Store is closed");
        return;
    }
    const response = await fetch(`/api/xReport?date=${reportDate}`);
    const data = await response.json();
    query = '#' + tableID; 
    const tableBody = document.querySelector(query);


    data.forEach(row => {
        const tableRow = document.createElement('tr');
        Object.values(row).forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            tableRow.appendChild(cell);
        });
        tableBody.appendChild(tableRow);
    });

    if (APIEndpoint == "/api/zReport") {
        const newDate = new Date(reportDate); 
        newDate.setDate(newDate.getDate() + 1); 
        reportDate = newDate.toISOString().split('T')[0]; 
    }
}


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


function populateProductUsageTable(data) {
    const tableBody = document.querySelector('#product-usage');

    if (data && data.length > 0) {
        data.forEach(row => {
            const tableRow = document.createElement('tr');
            tableRow.innerHTML = `
                <td>${row.ingredient_name}</td>
                <td>${row.total_usage}</td>
                <td>${row.time_period}</td>
            `;
            tableBody.appendChild(tableRow);
        });
    } else {
        const noDataRow = document.createElement('tr');
        noDataRow.innerHTML = '<td colspan="3">No usage data found for the given ingredient.</td>';
        tableBody.appendChild(noDataRow);
    }
}

let reportDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',  
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).format(new Date());

window.onload = setupTabs;

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

function enforceCamelCase(input) {
    input.value = toCamelCase(input.value);
}
