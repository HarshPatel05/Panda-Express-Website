//Translation Functionality
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: "en" },
        "googleTranslateElement"
    )
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
            else if (APIEndpoint == '/api/salesReport'){
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

let reportDate = new Date().toISOString().split('T')[0];
window.onload = setupTabs;
