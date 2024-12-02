//Translation Functionality
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: "en" },
        "googleTranslateElement"
    )
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

    const menuitemID = document.getElementById('menuItemID').value;

    const price = document.getElementById('newPrice').value;

    if (!menuitemID || !price) {
        alert("Please fill both required parts");
        return;
    }

    try  {
        await fetch('/api/changePrice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                menuItemID: menuItemID,
                newPrice: newPrice
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
    let currDate = new Date().toISOString().split('T')[0];
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

let reportDate = new Date().toISOString().split('T')[0];
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
