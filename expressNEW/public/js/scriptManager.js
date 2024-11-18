//Translation Functionality
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: "en" },
        "googleTranslateElement"
    )
}

async function populateTable(APIEndpoint, tableID) {
    const response = await fetch(APIEndpoint);
    const data = await response.json();
    query = '#' + tableID; 
    const tableBody = document.querySelector(query);

    tableBody.innerHTML = "";

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
