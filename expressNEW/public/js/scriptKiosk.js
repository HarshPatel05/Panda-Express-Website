let orderItems = [];
let currentCompositeItem = null;
let totalAmount = 0;
let selectedSize = 'Medium'; // Default size for A La Carte
let currentAlaCarteItem = null;


async function loadMenuItems() {
    try {
        const response = await fetch('/api/menuitems');
        if (!response.ok) {
            console.error('Failed to fetch menu items:', response.statusText);
            return;
        }

        const menuItems = await response.json();
        console.log('Fetched Menu Items:', menuItems);

        const entreeContainer = document.getElementById('entree-buttons');
        const sideContainer = document.getElementById('side-buttons');
        const appetizerContainer = document.getElementById('appetizer-buttons');
        const drinkContainer = document.getElementById('drink-buttons');

        const smallEntreeContainer = document.getElementById('small-entree-buttons');
        const smallSideContainer = document.getElementById('small-side-buttons');
        const mediumEntreeContainer = document.getElementById('medium-entree-buttons');
        const mediumSideContainer = document.getElementById('medium-side-buttons');
        const largeEntreeContainer = document.getElementById('large-entree-buttons');
        const largeSideContainer = document.getElementById('large-side-buttons');

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

        // Populate standard entrees, sides, drinks, and appetizers
        menuItems.forEach((item) => {

            if (item.size === 'sm') {
                if (item.menuitemid >= 1 && item.menuitemid <= 39) {
                    const button = document.createElement('button');
                    button.classList.add('menu-item-button');
                    button.dataset.menuId = item.menuitemid;
                    button.onclick = () => addComponentToCurrentOrder('entree', item.menuitemid, item.menuitem);
            
                    // Convert `item.menuitem` to normal case for the image file name
                    const normalizedMenuItem = camelCaseToNormal(item.menuitem); // Remove spaces for file path
            
                    // Add the image
                    const image = document.createElement('img');
                    image.src = `/Panda Express Photos/${normalizedMenuItem}.png`; // Image path
                    image.alt = camelCaseToNormal(item.menuitem); // Alt text for accessibility
                    image.classList.add('button-image'); // Optional: Add a class for styling
                    button.appendChild(image);
            
                    // Add the text
                    const text = document.createElement('div');
                    text.innerText = camelCaseToNormal(item.menuitem);
                    text.classList.add('button-text'); // Optional: Add a class for styling
                    button.appendChild(text);
            
                    entreeContainer.appendChild(button);
                }
            
                if (item.menuitemid >= 40 && item.menuitemid <= 51) {
                    const button = document.createElement('button');
                    button.classList.add('menu-item-button');
                    button.dataset.menuId = item.menuitemid;
                    button.onclick = () => addComponentToCurrentOrder('side', item.menuitemid, item.menuitem);
            
                    // Convert `item.menuitem` to normal case for the image file name
                    const normalizedMenuItem = camelCaseToNormal(item.menuitem); // Remove spaces for file path
            
                    // Add the image
                    const image = document.createElement('img');
                    image.src = `/Panda Express Photos/${normalizedMenuItem}.png`; // Image path
                    image.alt = camelCaseToNormal(item.menuitem); // Alt text for accessibility
                    image.classList.add('button-image'); // Optional: Add a class for styling
                    button.appendChild(image);
            
                    // Add the text
                    const text = document.createElement('div');
                    text.innerText = camelCaseToNormal(item.menuitem);
                    text.classList.add('button-text'); // Optional: Add a class for styling
                    button.appendChild(text);
            
                    sideContainer.appendChild(button);
                }
            }

            // Drinks and Appetizers with Labels
            if (item.menuitemid >= 52 && item.menuitemid <= 60) {
                const wrapper = document.createElement('div');
                wrapper.classList.add('menu-item-wrapper');

                const label = document.createElement('div');
                label.classList.add('menu-item-label');
                label.innerText = `${item.size} - $${item.price.toFixed(2)}`;

                const button = document.createElement('button');
                button.innerText = `${camelCaseToNormal(item.menuitem)}`;
                button.classList.add('menu-item-button');
                button.dataset.menuId = item.menuitemid;
                button.onclick = () => addItemToOrder(item.menuitemid, item.menuitem, item.price, 'appetizer');

                wrapper.appendChild(label);
                wrapper.appendChild(button);
                appetizerContainer.appendChild(wrapper);
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

            // Ensure containers exist
            const smallEntreeContainer = document.getElementById('small-entree-buttons');
            const smallSideContainer = document.getElementById('small-side-buttons');
            const mediumEntreeContainer = document.getElementById('medium-entree-buttons');
            const mediumSideContainer = document.getElementById('medium-side-buttons');
            const largeEntreeContainer = document.getElementById('large-entree-buttons');
            const largeSideContainer = document.getElementById('large-side-buttons');

            if (item.size === 'sm') {
                if (item.menuitemid >= 1 && item.menuitemid <= 39) {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.onclick = () => addAlaCarteItem('entree', item.menuitemid, item.menuitem, item.size, item.price);
                    smallEntreeContainer.appendChild(button);
                } else if (item.menuitemid >= 40 && item.menuitemid <= 51) {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.onclick = () => addAlaCarteItem('side', item.menuitemid, item.menuitem, item.size, item.price);
                    smallSideContainer.appendChild(button);
                }
            } else if (item.size === 'md') {
                if (item.menuitemid >= 1 && item.menuitemid <= 39) {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.onclick = () => addAlaCarteItem('entree', item.menuitemid, item.menuitem, item.size, item.price);
                    mediumEntreeContainer.appendChild(button);
                } else if (item.menuitemid >= 40 && item.menuitemid <= 51) {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.onclick = () => addAlaCarteItem('side', item.menuitemid, item.menuitem, item.size, item.price);
                    mediumSideContainer.appendChild(button);
                }
            } else if (item.size === 'lg') {
                if (item.menuitemid >= 1 && item.menuitemid <= 39) {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.onclick = () => addAlaCarteItem('entree', item.menuitemid, item.menuitem, item.size, item.price);
                    largeEntreeContainer.appendChild(button);
                } else if (item.menuitemid >= 40 && item.menuitemid <= 51) {
                    const button = document.createElement('button');
                    button.innerText = `${camelCaseToNormal(item.menuitem)} (${item.size})`;
                    button.classList.add('menu-item-button');
                    button.onclick = () => addAlaCarteItem('side', item.menuitemid, item.menuitem, item.size, item.price);
                    largeSideContainer.appendChild(button);
                }
            }
        });
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

// Handle size selection and panel toggling
function setSize(size) {
    const panels = document.querySelectorAll('#sizePanels > .hidden-panel');
    panels.forEach((panel) => (panel.style.display = 'none')); // Hide all panels

    const selectedPanel = document.getElementById(`size-${size}-panel`);
    if (selectedPanel) {
        selectedPanel.style.display = 'block'; // Show the selected size panel
    }

    const sizeButtons = document.querySelectorAll('.size-button');
    sizeButtons.forEach((button) => {
        button.style.backgroundColor = button.id === `size-${size}` ? 'green' : '';
    });

    // Hide the sides section and title for "Small" A La Carte
    if (size === 'Small') {
        const sideSections = selectedPanel.querySelectorAll('.sides-section');
        sideSections.forEach(section => (section.style.display = 'none')); // Hide sides

        const sideHeaders = selectedPanel.querySelectorAll('.section-header');
        sideHeaders.forEach(header => {
            if (header.textContent === 'Sides') {
                header.style.display = 'none'; // Hide side title
            }
        });
    } else {
        const sideSections = selectedPanel.querySelectorAll('.sides-section');
        sideSections.forEach(section => (section.style.display = 'block')); // Show sides

        const sideHeaders = selectedPanel.querySelectorAll('.section-header');
        sideHeaders.forEach(header => {
            if (header.textContent === 'Sides') {
                header.style.display = 'block'; // Show side title
            }
        });
    }
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

function addAlaCarteItem(category, menuId, itemName, size, price) {
    // Set the current A La Carte item for preview
    currentAlaCarteItem = {
        size: size,
        category: category,
        menuId: menuId,
        itemName: camelCaseToNormal(itemName), // Format for readability
        price: price
    };

    // Update the preview
    updateAlaCartePreview();
}

function updateAlaCartePreview() {
    const preview = document.getElementById("currentItemPreview");

    if (!currentAlaCarteItem) {
        preview.innerHTML = ""; // Clear preview if no item selected
        return;
    }

    let previewHTML = `
        <strong>${currentAlaCarteItem.size} A La Carte</strong><br>
        <div class='item-components'>
            <div>- ${currentAlaCarteItem.itemName}</div>
        </div>
        <button onclick="cancelCurrentAlaCarteItem()">Cancel</button>
    `;

    preview.innerHTML = previewHTML;
}

function finalizeAlaCarteItem() {
    if (!currentAlaCarteItem) return;

    // Convert size abbreviation to full name
    const fullSizeName = getFullSizeName(currentAlaCarteItem.size);

    // Add the finalized item to the order with its menuId
    const orderItem = {
        menuIds: [currentAlaCarteItem.menuId], // Store the menuId of the item
        name: `${fullSizeName} A La Carte`,
        price: currentAlaCarteItem.price,
        type: 'a la carte',
        components: [{ itemName: currentAlaCarteItem.itemName }] // Include the item name
    };

    // Add the order item to the orderItems array
    orderItems.push(orderItem);

    // Refresh the order list
    updateOrderList();

    // Update the total price
    calculateTotal();

    // Clear the preview
    currentAlaCarteItem = null;
    updateAlaCartePreview();

    // Close the panel and return to the main buttons
    closePanel();
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

// Open a specific hidden panel and hide the main grid
function openPanel(panelId) {
    // Hide the main buttons grid
    const mainButtons = document.getElementById('main-buttons');
    mainButtons.style.display = 'none';

    const middleContainer = document.querySelector('.grid-container');
    if (middleContainer) {
        middleContainer.style.display = 'none';
    }

    // Show the requested hidden panel
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.style.display = 'block';
    }

    // Optional: Add smooth scrolling to the top of the panel (optional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close any open hidden panel and show the main grid and middle container
function closePanel() {
    // Hide all hidden panels
    const panels = document.querySelectorAll('.hidden-panel');
    panels.forEach((panel) => {
        panel.style.display = 'none';
    });

    // Show the main buttons grid
    const mainButtons = document.getElementById('main-buttons');
    mainButtons.style.display = 'grid';

    // Show the middle container
    const middleContainer = document.querySelector('.grid-container');
    if (middleContainer) {
        middleContainer.style.display = 'block';
    }
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