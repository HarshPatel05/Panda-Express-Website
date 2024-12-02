let orderItems = [];
let currentCompositeItem = null;
let totalAmount = 0;
let selectedSize = 'Medium'; // Default size for A La Carte
let currentAlaCarteItem = null;

let menuItemMap = {}; // Define globally


let selectedAppetizer = null;
let appetizerSize = 'sm'; // Default size
let appetizerQuantity = 1; // Default quantity
let appetizerMap = {};

async function loadMenuItems() {
    try {
        const response = await fetch('/api/menuitems');
        if (!response.ok) {
            console.error('Failed to fetch menu items:', response.statusText);
            return;
        }

        const menuItems = await response.json();
        console.log('Fetched Menu Items:', menuItems);

        const appetizerContainer = document.getElementById('appetizer-buttons');
        if (!appetizerContainer) {
            console.error('Appetizer container not found');
            return;
        }

        const entreeContainer = document.getElementById('entree-buttons');
        const sideContainer = document.getElementById('side-buttons');
        const drinkContainer = document.getElementById('drink-buttons');

        // Debug containers
        if (!entreeContainer) console.error("Entree container not found");
        if (!sideContainer) console.error("Side container not found");

        // Find and assign the menuIds for bowls, plates, and bigger plates
        const bowlData = menuItems.find(item => item.menuitem === 'bowl');
        const plateData = menuItems.find(item => item.menuitem === 'plate');
        const biggerPlateData = menuItems.find(item => item.menuitem === 'biggerPlate');

        // Assign onclick handlers with dynamic menuIds for static buttons
        if (bowlData) {
            const bowlButton = document.querySelector('.button[onclick*="selectItemType(\'bowl\'"]');
            if (bowlButton) {
                bowlButton.onclick = () => selectItemType('bowl', 8.30, 1, 2, bowlData.menuitemid);
            }
        }

        if (plateData) {
            const plateButton = document.querySelector('.button[onclick*="selectItemType(\'plate\'"]');
            if (plateButton) {
                plateButton.onclick = () => selectItemType('plate', 9.80, 2, 2, plateData.menuitemid);
            }
        }

        if (biggerPlateData) {
            const biggerPlateButton = document.querySelector('.button[onclick*="selectItemType(\'biggerPlate\'"]');
            if (biggerPlateButton) {
                biggerPlateButton.onclick = () => selectItemType('biggerPlate', 11.30, 3, 2, biggerPlateData.menuitemid);
            }
        }

        const alacarteEntreeContainer = document.getElementById('ALaCarte-entrees');
        const alacarteSideContainer = document.getElementById('ALaCarte-sides');
        
        if (!alacarteEntreeContainer) {
            console.error("ALaCarte-entrees container not found in the DOM.");
            return;
        }
        
        if (!alacarteSideContainer) {
            console.error("ALaCarte-sides container not found in the DOM.");
            return;
        } 

        menuItems.forEach((item) => {
            if (!menuItemMap[item.menuitem]) {
                menuItemMap[item.menuitem] = {
                    sm: null,
                    md: null,
                    lg: null,
                };
            }
            // Populate size-specific details
            menuItemMap[item.menuitem][item.size] = {
                menuitemid: item.menuitemid,
                price: item.price,
                displayname: item.displayname,
            };
        });

        menuItems.forEach((item) => {
            // Add entrees to the À La Carte panel
            if (item.size === 'sm' && item.menuitemid >= 1 && item.menuitemid <= 39) {
                const button = document.createElement('button');
                button.classList.add('menu-item-button');
                button.dataset.menuId = item.menuitemid;
                button.onclick = () => addAlaCarteItem('entree', item.menuitemid, item.menuitem, 'sm', item.price);
    
                // Convert `item.menuitem` to normal case for the image file name
                const normalizedMenuItem = camelCaseToNormal(item.menuitem);
    
                // Add the text
                const text = document.createElement('div');
                text.innerText = camelCaseToNormal(item.menuitem);
                text.classList.add('button-text');
                button.appendChild(text);
    
                // Append to the À La Carte entrees container
                alacarteEntreeContainer.appendChild(button);
            }
    
            // Add sides to the À La Carte panel
            if (item.size === 'sm' && item.menuitemid >= 40 && item.menuitemid <= 51) {
                const button = document.createElement('button');
                button.classList.add('menu-item-button');
                button.dataset.menuId = item.menuitemid;
                button.onclick = () => addAlaCarteItem('side', item.menuitemid, item.menuitem, 'sm', item.price);
    
                // Convert `item.menuitem` to normal case for the image file name
                const normalizedMenuItem = camelCaseToNormal(item.menuitem);
    
                // Add the text
                const text = document.createElement('div');
                text.innerText = camelCaseToNormal(item.menuitem);
                text.classList.add('button-text');
                button.appendChild(text);
    
                // Append to the À La Carte sides container
                alacarteSideContainer.appendChild(button);
            }
        });

        // Populate standard entrees, sides, drinks, and appetizers
        menuItems.forEach((item) => {

            if (item.size === 'sm') {
                if (item.menuitemid >= 1 && item.menuitemid <= 39) {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.dataset.menuId = item.menuitemid;
                    button.onclick = () => addComponentToCurrentOrder('entree', item.menuitemid, item.menuitem);
                    entreeContainer.appendChild(button);
                }

                if (item.menuitemid >= 40 && item.menuitemid <= 51) {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.dataset.menuId = item.menuitemid;
                    button.onclick = () => addComponentToCurrentOrder('side', item.menuitemid, item.menuitem);
                    sideContainer.appendChild(button);
                }
            }

            // Drinks and Appetizers with Labels
            if (item.menuitemid >= 52 && item.menuitemid <= 60) {
                console.log('Processing Appetizer:', item); // Debug log
        
                // Get the panel-content container inside the appetizersPanel
                const appetizersPanelContent = document.querySelector('#appetizersPanel .panel-content');
                if (!appetizersPanelContent) {
                    console.error('Appetizers panel-content not found');
                    return;
                }
        
                // Create a button for the appetizer
                const button = document.createElement('button');
                button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                button.classList.add('menu-item-button');
                button.dataset.menuId = item.menuitemid;
                button.dataset.size = item.size;
                button.dataset.price = item.price;
        
                // Attach click handler to open the modal or perform the action
                button.onclick = () => addAppetizerToOrder(item.menuitem, item.price);
        
                // Append the button to the appetizersPanelContent
                appetizersPanelContent.appendChild(button);
                console.log('Appetizer Button Added:', button);
            }

            if (item.menuitemid >= 61 && item.menuitemid <= 68) {
                const wrapper = document.createElement('div');
                wrapper.classList.add('menu-item-wrapper');

                const label = document.createElement('div');
                label.classList.add('menu-item-label');
                label.innerText = `${item.size} - $${item.price.toFixed(2)}`;

                const button = document.createElement('button');
                button.innerText = `${camelCaseToNormal(item.menuitem)}`;
                button.classList.add('menu-item-button');
                button.dataset.menuId = item.menuitemid;
                button.onclick = () => addItemToOrder(item.menuitemid, item.menuitem, item.price, 'drink');

                wrapper.appendChild(label);
                wrapper.appendChild(button);
                drinkContainer.appendChild(wrapper);
            }
        });
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

async function loadSeasonalItems() {
    try {
        const seasonalItemsResponse = await fetch('/api/getactiveseasonalitems');
        if (!seasonalItemsResponse.ok) {
            console.error('Failed to fetch seasonal items:', seasonalItemsResponse.statusText);
            return;
        }

        const seasonalItems = await seasonalItemsResponse.json();
        console.log('Fetched Seasonal Items:', seasonalItems);

        const entreeContainer = document.getElementById('entree-buttons');
        const sideContainer = document.getElementById('side-buttons');

        if (!entreeContainer || !sideContainer) {
            console.error('One or more containers are missing in the DOM.');
            return;
        }

        // Process seasonal items for Bowls, Plates, and Bigger Plates
        seasonalItems.forEach((item) => {
            if (item.size === 'sm') {
                // Seasonal Entrees
                if (item.type === 'entree') {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.dataset.menuId = item.menuitemid;
                    button.onclick = () => addComponentToCurrentOrder('entree', item.menuitemid, item.menuitem);
                    entreeContainer.appendChild(button);
                }

                // Seasonal Sides
                if (item.type === 'side') {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.dataset.menuId = item.menuitemid;
                    button.onclick = () => addComponentToCurrentOrder('side', item.menuitemid, item.menuitem);
                    sideContainer.appendChild(button);
                }
            }
        });

        const alacarteEntreeContainer = document.getElementById('ALaCarte-entrees');
        const alacarteSideContainer = document.getElementById('ALaCarte-sides');

        if (!alacarteEntreeContainer || !alacarteSideContainer) {
            console.error('One or more À La Carte containers are missing in the DOM.');
            return;
        }

        // Process seasonal items for À La Carte
        seasonalItems.forEach((item) => {
            if (item.size === 'sm') {
                // Seasonal Entrees
                if (item.type === 'entree') {
                    const button = document.createElement('button');
                    button.classList.add('menu-item-button');
                    button.dataset.menuId = item.menuitemid;
                    button.onclick = () => addAlaCarteItem('entree', item.menuitemid, item.menuitem, 'sm', item.price);

                    // Add the text
                    const text = document.createElement('div');
                    text.innerText = camelCaseToNormal(item.menuitem);
                    text.classList.add('button-text');
                    button.appendChild(text);

                    alacarteEntreeContainer.appendChild(button);
                }

                // Seasonal Sides
                if (item.type === 'side') {
                    const button = document.createElement('button');
                    button.classList.add('menu-item-button');
                    button.dataset.menuId = item.menuitemid;
                    button.onclick = () => addAlaCarteItem('side', item.menuitemid, item.menuitem, 'sm', item.price);

                    // Add the text
                    const text = document.createElement('div');
                    text.innerText = camelCaseToNormal(item.menuitem);
                    text.classList.add('button-text');
                    button.appendChild(text);

                    alacarteSideContainer.appendChild(button);
                }
            }
        });

        const appetizersPanelContent = document.getElementById('appetizer-buttons');
        if (!appetizersPanelContent) {
            console.error('Appetizers panel-content not found');
            return;
        }

        // Process seasonal items for appetizers
        seasonalItems.forEach((item) => {
            if (item.type === 'appetizer') {
                console.log('Processing Seasonal Appetizer:', item); // Debug log

                // Create a button for the seasonal appetizer
                const button = document.createElement('button');
                button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                button.classList.add('menu-item-button');
                button.dataset.menuId = item.menuitemid;
                button.dataset.size = item.size;
                button.dataset.price = item.price;

                // Attach click handler to open the modal or perform the action
                button.onclick = () => addAppetizerToOrder(item.menuitem, item.price);

                // Append the button to the appetizersPanelContent
                appetizersPanelContent.appendChild(button);
                console.log('Seasonal Appetizer Button Added:', button);
            }
        });

        console.log('Seasonal Appetizers Loaded Successfully.');
    } catch (error) {
        console.error('Error loading seasonal items:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSeasonalItems();
});

// Handle size selection and panel toggling
function setSize(size) {
    // Hide all size-specific panels
    const panels = document.querySelectorAll('#sizePanels > .hidden-panel');
    panels.forEach((panel) => {
        if (panel) panel.style.display = 'none'; // Null-check added
    });

    // Show the selected size panel
    const selectedPanel = document.getElementById(`size-${size}-panel`);
    if (selectedPanel) {
        selectedPanel.style.display = 'block'; // Null-check added
    } else {
        console.error(`Panel for size ${size} not found in DOM.`);
    }

    // Update the active button style
    const sizeButtons = document.querySelectorAll('.size-button');
    sizeButtons.forEach((button) => {
        if (button.id === `size-${size}`) {
            button.style.backgroundColor = 'green';
        } else {
            button.style.backgroundColor = ''; // Reset others
        }
    });
}



document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    setSize('Medium'); // Default size to display
});

// Function to initialize a new composite item (bowl, plate, or bigger plate)
function selectItemType(type, price, entreesRequired, sidesRequired, menuId) {
    currentCompositeItem = {
        type: type,
        name: capitalize(type),
        price: price,
        menuId: menuId, // Store the menuId for the composite item
        entreesRequired: entreesRequired,
        sidesRequired: sidesRequired,
        entrees: [],
        sides: []
    };
    updateCurrentItemPreview();
    openPanel('hiddenPanelMain');
}

function addItemToOrder(menuIds, name, price, type, components = []) {
    const orderItem = {
        menuIds: Array.isArray(menuIds) ? menuIds : [menuIds], // Composite and component IDs
        name: name,
        price: price,
        type: type,
        components: components // Store components (entrees and sides)
    };

    orderItems.push(orderItem);
    updateOrderList();
    calculateTotal();
}

function updateOrderList() {
    const orderList = document.getElementById("orderList");
    orderList.innerHTML = ""; // Clear the current list

    orderItems.forEach((item, index) => {
        const listItem = document.createElement("div");
        listItem.classList.add("order-item");

        // Display the main item (e.g., Bowl, Plate, Bigger Plate)
        let listItemHTML = `
            <div><strong>${camelCaseToNormal(item.name)} +$${item.price.toFixed(2)}</strong></div>
        `;

        // If the item has components (e.g., entrees and sides), display them
        if (item.components && item.components.length > 0) {
            listItemHTML += `
                <div class="item-components">
                    ${item.components.map(comp => `<div>- ${camelCaseToNormal(comp.itemName)}</div>`).join('')}
                </div>
            `;
        }

        listItemHTML += `
            <button onclick="removeItemFromOrder(${index})">Remove</button>
        `;

        listItem.innerHTML = listItemHTML;
        orderList.appendChild(listItem);
    });
}

// Function to add a component (entree or side) to the current composite item
function addComponentToCurrentOrder(category, menuId, itemName) {
    if (!currentCompositeItem) return;

    // Add entrees or sides to the current composite item
    if (category === 'entree' && currentCompositeItem.entrees.length < currentCompositeItem.entreesRequired) {
        currentCompositeItem.entrees.push({ menuId, itemName });
    } else if (category === 'side' && currentCompositeItem.sides.length < currentCompositeItem.sidesRequired) {
        currentCompositeItem.sides.push({ menuId, itemName });
    }

    updateCurrentItemPreview();

    // Check if the current composite item is complete
    const isComplete =
        currentCompositeItem.entrees.length === currentCompositeItem.entreesRequired &&
        currentCompositeItem.sides.length === currentCompositeItem.sidesRequired;

    if (isComplete) {
        const allMenuIds = [
            currentCompositeItem.menuId, // Composite item menuId
            ...currentCompositeItem.entrees.map(e => e.menuId),
            ...currentCompositeItem.sides.map(s => s.menuId)
        ];

        const components = [
            ...currentCompositeItem.entrees,
            ...currentCompositeItem.sides
        ];

        addItemToOrder(allMenuIds, currentCompositeItem.name, currentCompositeItem.price, 'composite', components);
        currentCompositeItem = null; // Reset the composite item
        updateCurrentItemPreview(); // Clear preview
        closePanel();
    }
}

// Other supporting functions remain the same
// Function to add a drink to the order
function addDrinkToOrder(drinkName, price, size = null) {
    const drinkItem = {
        type: 'drink',
        name: size ? `${size} ${drinkName}` : drinkName,
        price: price,
        components: []
    };
    orderItems.push(drinkItem);
    updateOrderList();
    calculateTotal();
    closePanel();
}

// Function to add an appetizer to the order
function addAppetizerToOrder(appetizerName, price) {
    const appetizerItem = {
        type: 'appetizer',
        name: appetizerName,
        price: price,
        components: []
    };
    orderItems.push(appetizerItem);
    updateOrderList();
    calculateTotal();
    closePanel();
}

// Adjust the size
function selectAlaCarteSize(size) {
    alaCarteSize = size; // Update selected size
    const sizeButtons = document.querySelectorAll('#sizeSelection .size-button');
    sizeButtons.forEach((button) => {
        if (button.id === `${size}Size`) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });

    // Fetch price dynamically from menuItemMap
    const selectedSizeData = menuItemMap[selectedAlaCarteItem.menuitem]?.[size];
    if (selectedSizeData) {
        const price = selectedSizeData.price;
        console.log(`Price for selected size (${size}): $${price.toFixed(2)}`);
        document.getElementById('alaCartePrice').innerText = `$${price.toFixed(2)}`;
    } else {
        console.error(`Size data for ${size} not found in menuItemMap.`);
    }
}


// Adds the item to the order
function addAlaCarteToOrder() {
    if (!selectedAlaCarteItem || !menuItemMap[selectedAlaCarteItem.menuitem]) {
        console.error("Invalid item selected or item not found in menu map.");
        return;
    }

    const selectedSizeData = menuItemMap[selectedAlaCarteItem.menuitem][alaCarteSize];
    if (!selectedSizeData) {
        console.error(`Size data for ${alaCarteSize} not found.`);
        return;
    }

    const { menuitemid, price } = selectedSizeData;

    const alaCarteOrder = {
        type: 'a la carte',
        name: `${camelCaseToNormal(selectedAlaCarteItem.menuitem)} (${capitalize(alaCarteSize)})`,
        size: alaCarteSize,
        price: price,
        quantity: alaCarteQuantity,
        menuIds: Array(alaCarteQuantity).fill(menuitemid),
    };

    // Add to the order and update UI
    orderItems.push(alaCarteOrder);
    updateOrderList();
    calculateTotal();
    closeAlaCarteModal();
}



function addAlaCarteItem(category, menuId, itemName, size, price) {
    console.log(`Adding A La Carte item: ${itemName}, Category: ${category}, Size: ${size}, Price: ${price}`);

    // Open the A La Carte modal with the selected item details
    openAlaCarteModal({
        category: category,
        menuitemid: menuId,
        menuitem: itemName,
        price: price,
        size: size,
    });
}

// Opens the modal for A La Carte items
function openAlaCarteModal(menuItem) {
    selectedAlaCarteItem = menuItem;
    alaCarteSize = 'md'; // Default size
    alaCarteQuantity = 1;

    const normalizedMenuItem = camelCaseToNormal(menuItem.menuitem);

    // Update modal content
    const itemNameElement = document.getElementById('alaCarteItemName');
    if (itemNameElement) {
        itemNameElement.innerText = normalizedMenuItem;
    } else {
        console.error('Element with ID alaCarteItemName not found.');
    }

    // Dynamically populate size buttons and prices
    const sizeSelection = document.getElementById('sizeSelection');
    if (sizeSelection) {
        sizeSelection.innerHTML = ''; // Clear existing buttons

        Object.keys(menuItemMap[menuItem.menuitem]).forEach((size) => {
            const sizeData = menuItemMap[menuItem.menuitem][size];

            // Skip the small size for all side options
            if (menuItem.category === 'side' && size === 'sm') {
                return; // Do not render the small button for sides
            }

            if (sizeData) {
                const sizeButton = document.createElement('button');
                sizeButton.classList.add('size-button');
                sizeButton.id = `${size}Size`;
                sizeButton.innerHTML = `${capitalize(size)}<br>$${sizeData.price.toFixed(2)}`;
                sizeButton.onclick = () => selectAlaCarteSize(size);

                sizeSelection.appendChild(sizeButton);
            }
        });
    } else {
        console.error('Element with ID sizeSelection not found.');
    }

    // Set default price for the default size
    const modal = document.getElementById('alaCarteModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Element with ID alaCarteModal not found.');
    }
}

// Closes the modal
function closeAlaCarteModal() {
    const modal = document.getElementById('alaCarteModal');
    if (modal) {
        modal.style.display = 'none'; // Hide the modal
    }
    selectedAlaCarteItem = null; // Reset the selected item
    alaCarteSize = 'md'; // Reset size to default
    alaCarteQuantity = 1; // Reset quantity
}

// Update preview for the current composite item
function updateCurrentItemPreview() {
    const preview = document.getElementById("currentItemPreview");
    if (!currentCompositeItem) {
        preview.innerHTML = "";
        return;
    }

    let previewHTML = `<strong>${camelCaseToNormal(currentCompositeItem.name)} +$${currentCompositeItem.price.toFixed(2)}</strong><br>`;
    previewHTML += "<div class='item-components'>";
    
    // Display readable names for entrees
    previewHTML += currentCompositeItem.entrees
        .map(entree => `<div>- ${camelCaseToNormal(entree.itemName)}</div>`)
        .join('');
    
    // Display readable names for sides
    previewHTML += currentCompositeItem.sides
        .map(side => `<div>- ${camelCaseToNormal(side.itemName)}</div>`)
        .join('');
    
    previewHTML += "</div>";

    preview.innerHTML = previewHTML;
}

function removeItemFromOrder(index) {
    if (index >= 0 && index < orderItems.length) {
        orderItems.splice(index, 1);
        updateOrderList();
        calculateTotal();
    }
}

// Cancel the current composite item
function cancelCurrentCompositeItem() {
    currentCompositeItem = null;
    updateCurrentItemPreview();
    closePanel();
}

function calculateTotal() {
    totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);
    document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);
}

function clearOrder() {
    orderItems = [];
    totalAmount = 0;
    updateOrderList();
    calculateTotal();
    updateCurrentItemPreview();
}

// Open and close panels
function openPanel(panelId) {
    document.getElementById('main-buttons').style.display = 'none';
    document.getElementById(panelId).style.display = 'block';
}

function closePanel() {
    document.querySelectorAll('.hidden-panel').forEach(panel => panel.style.display = 'none');
    document.getElementById('main-buttons').style.display = 'grid';
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function camelCaseToNormal(camelCaseString) {
    return camelCaseString
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add a space before each uppercase letter
        .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
}

function getFullSizeName(abbreviation) {
    const sizeMap = {
        sm: "Small",
        md: "Medium",
        lg: "Large"
    };
    return sizeMap[abbreviation.toLowerCase()] || abbreviation; // Fallback to original if not found
}

function checkoutOrder()
{
    // Check if there are no items in the order
    if (orderItems.length === 0)
    {
        alert('Your order is empty. Please add items before checking out.');
        return; // Exit the function if order is empty
    }

    // Flatten the array of menuIds from each order item
    const menuItemIDs = orderItems.flatMap(item => item.menuIds); // Flatten array of menuIds

    // Make the POST request to the server to update the order
    fetch('/api/updateorders',
    {
        method: 'POST', // HTTP method for sending data
        headers: { 'Content-Type': 'application/json' }, // Tell the server the data is in JSON format
        body: JSON.stringify
        ({
            totalCost: totalAmount, // Send the total cost of the order (totalAmount is a global variable)
            menuItemIDs: menuItemIDs, // Send the array of menu item IDs
        })
    })

    .then(response =>
    {
        // If the response is not OK, throw an error to be caught in the catch block
        if (!response.ok)
        {
            throw new Error('Failed to update order.');
        }
        return response.json(); // If the response is OK, parse the JSON response (which contains the server message from server.js)
    })

    .then(data =>
    {
        // Show a success message with the total cost and the server's response message
        alert(`Order placed successfully!\nOrder total: $${totalAmount.toFixed(2)}\n${data.message}`);
        clearOrder(); // Clear the order items after successful checkout

        updateInventory(menuItemIDs); // inventory update should only happen if the order update succeeds
    })

    .catch(error =>
    {
        // Log and display an error message if something went wrong
        console.error('Error:', error);
        alert('An error occurred while placing your order. Please try again.');
    });
}


function updateInventory(menuItemIDs)
{
    // Make the POST request to update the inventory
    fetch('/api/updateinventory',
    {
        method: 'POST', // HTTP method for sending data
        headers: { 'Content-Type': 'application/json' }, // Tell the server the data is in JSON format
        body: JSON.stringify
        ({
            menuItemIDs: menuItemIDs // Send the array of menu item IDs for inventory update
        })
    })

    .then(response =>
    {
        // If the response is not OK, throw an error to be caught in the catch block
        if (!response.ok)
        {
            throw new Error('Failed to update inventory.');
        }
        return response.json(); // If the response is OK, parse the JSON response
    })

    .then(data =>
    {
        // Show a success message for inventory update
        alert(`Inventory updated successfully!\n${data.message}`);
    })

    .catch(error =>
    {
        // Log and display an error message if something went wrong
        console.error('Error:', error);
        alert('An error occurred while updating inventory. Please try again.');
    });
}