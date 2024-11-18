let orderItems = [];
let currentCompositeItem = null;
let totalAmount = 0;
let selectedSize = 'Medium'; // Default size for A La Carte
let currentAlaCarteItem = null;

let selectedDrink = null;
let selectedDrinkSize = 'sm';
let selectedQuantity = 1;

let selectedAlaCarteItem = null; // Tracks the current selected item
let alaCarteSize = 'md'; // Default size
let alaCarteQuantity = 1;

let menuItems = []; // To store the fetched menu items
let menuItemMap = {}; // To group menu items by `menuitem`

let selectedAppetizer = null;
let appetizerSize = 'sm'; // Default size
let appetizerQuantity = 1; // Default quantity

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
        // Add entrees to the À La Carte panel
        if (item.size === 'sm' && item.menuitemid >= 1 && item.menuitemid <= 39) {
            const button = document.createElement('button');
            button.classList.add('menu-item-button');
            button.dataset.menuId = item.menuitemid;
            button.onclick = () => addAlaCarteItem('entree', item.menuitemid, item.menuitem, 'sm', item.price);

            // Convert `item.menuitem` to normal case for the image file name
            const normalizedMenuItem = camelCaseToNormal(item.menuitem);

            // Add the image
            const image = document.createElement('img');
            image.src = `/Panda Express Photos/${normalizedMenuItem}.png`;
            image.alt = camelCaseToNormal(item.menuitem);
            image.classList.add('button-image');
            button.appendChild(image);

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

            // Add the image
            const image = document.createElement('img');
            image.src = `/Panda Express Photos/${normalizedMenuItem}.png`;
            image.alt = camelCaseToNormal(item.menuitem);
            image.classList.add('button-image');
            button.appendChild(image);

            // Add the text
            const text = document.createElement('div');
            text.innerText = camelCaseToNormal(item.menuitem);
            text.classList.add('button-text');
            button.appendChild(text);

            // Append to the À La Carte sides container
            alacarteSideContainer.appendChild(button);
        }
    });

        menuItems.forEach((item) => {
            // Group items by `menuitem`
            if (!menuItemMap[item.menuitem]) {
                menuItemMap[item.menuitem] = {
                    sm: null,
                    md: null,
                    lg: null,
                };
            }
            // Store the data for each size
            menuItemMap[item.menuitem][item.size] = {
                menuitemid: item.menuitemid,
                price: item.price,
                displayname: item.displayname,
            };
        });

        console.log('Menu Item Map:', menuItemMap); // Debug to ensure the map is correctly created

        // Populate standard entrees, sides, and appetizers
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
        });

        menuItems.forEach((item) => {
            if (item.category && item.category.toLowerCase() === 'appetizer') {
                // Ensure the menuItemMap exists for grouping
                if (!menuItemMap[item.menuitem]) {
                    menuItemMap[item.menuitem] = { sm: null, md: null, lg: null };
                }
        
                // Map size data
                menuItemMap[item.menuitem][item.size] = {
                    menuitemid: item.menuitemid,
                    price: item.price,
                    displayname: item.displayname,
                };
        
                // Create button for each appetizer
                const button = document.createElement('button');
                button.classList.add('menu-item-button');
                button.dataset.menuId = item.menuitemid;
                button.onclick = () => openAppetizerModal(item);
        
                // Add image to button
                const image = document.createElement('img');
                image.src = `/Panda Express Photos/${camelCaseToNormal(item.menuitem)}.png`;
                image.alt = camelCaseToNormal(item.menuitem);
                image.classList.add('button-image');
                button.appendChild(image);
        
                // Add text to button
                const text = document.createElement('div');
                text.innerText = camelCaseToNormal(item.displayname);
                text.classList.add('button-text');
                button.appendChild(text);
        
                // Append button to the appetizer container
                appetizerContainer.appendChild(button);
            }
        });
        
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
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

        const itemPrice = typeof item.price === 'number' ? item.price : 0;
        const itemQuantity = item.quantity || 1;
        const totalPrice = itemPrice * itemQuantity;

        if (isNaN(totalPrice)) {
            console.error('Invalid total price for item:', item);
        }

        // Display main item details
        let listItemHTML = `
            <div>
                <strong>${item.size ? `(${capitalize(item.size)}) ` : ''}${item.type === 'a la carte' ? 'A La Carte' : item.name} x${itemQuantity}</strong> 
                <span>+$${totalPrice.toFixed(2)}</span>
            </div>
        `;

        // Add sub-item details for specific item types
        if (item.type === 'a la carte') {
            listItemHTML += `
                <div class="item-components">
                    <div>- ${item.name}</div>
                </div>
            `;
        } else if (item.type === 'composite' && item.components?.length > 0) {
            listItemHTML += `
                <div class="item-components">
                    ${item.components
                        .map(component => `<div>- ${component.itemName}</div>`)
                        .join('')}
                </div>
            `;
        } else if (item.type === 'appetizer') {
            listItemHTML += `
                <div class="item-components">
                    <div>- ${item.name} (${capitalize(item.size)})</div>
                </div>
            `;
        }

        // Add a "Remove" button
        listItemHTML += `
            <button onclick="removeItemFromOrder(${index})" class="remove-button">
                Remove
            </button>
        `;

        listItem.innerHTML = listItemHTML;
        orderList.appendChild(listItem);
    });
}



// Function to add a component (entree or side) to the current composite item
function addComponentToCurrentOrder(category, menuId, itemName) {
    if (!currentCompositeItem) {
        console.error("No active composite item. Cannot add components.");
        return;
    }

    if (category === 'entree' && currentCompositeItem.entrees.length < currentCompositeItem.entreesRequired) {
        currentCompositeItem.entrees.push({ menuId, itemName });
    } else if (category === 'side' && currentCompositeItem.sides.length < currentCompositeItem.sidesRequired) {
        currentCompositeItem.sides.push({ menuId, itemName });
    } else {
        console.warn(`Cannot add more ${category}s. Limit reached.`);
    }

    // Update the item preview after adding
    updateCurrentItemPreview();

    // Automatically finalize if the composite item is complete
    const isComplete =
        currentCompositeItem.entrees.length === currentCompositeItem.entreesRequired &&
        currentCompositeItem.sides.length === currentCompositeItem.sidesRequired;

    if (isComplete) {
        finalizeCompositeItem();
    }
}

function updateCurrentItemPreview() {
    const preview = document.getElementById('currentItemPreview'); // Ensure this element exists in your HTML
    if (!preview) {
        console.error("Preview container not found.");
        return;
    }

    if (!currentCompositeItem) {
        preview.innerHTML = ""; // Clear preview if no active composite item
        return;
    }

    let previewHTML = `<strong>${camelCaseToNormal(currentCompositeItem.name)} +$${currentCompositeItem.price.toFixed(2)}</strong><br>`;
    previewHTML += "<div class='item-components'>";

    // Add entrees and sides to the preview
    currentCompositeItem.entrees.forEach(entree => {
        previewHTML += `<div>- ${camelCaseToNormal(entree.itemName)}</div>`;
    });
    currentCompositeItem.sides.forEach(side => {
        previewHTML += `<div>- ${camelCaseToNormal(side.itemName)}</div>`;
    });

    previewHTML += "</div>";
    preview.innerHTML = previewHTML;
}


function finalizeCompositeItem() {
    if (!currentCompositeItem) {
        console.error("No active composite item to finalize.");
        return;
    }

    // Collect all menu IDs of the components
    const componentMenuIds = [
        ...currentCompositeItem.entrees.map(entree => entree.menuId),
        ...currentCompositeItem.sides.map(side => side.menuId),
    ];

    // Use the base price of the composite item only
    const totalPrice = currentCompositeItem.price;

    // Validate the total price
    if (isNaN(totalPrice)) {
        console.error('Failed to calculate total price. Debugging data:', {
            basePrice: currentCompositeItem.price,
            entrees: currentCompositeItem.entrees,
            sides: currentCompositeItem.sides,
        });
        return;
    }

    // Add the composite item to orderItems
    addItemToOrder(
        [currentCompositeItem.menuId, ...componentMenuIds], // Include the composite menu ID and all component IDs
        currentCompositeItem.name,
        totalPrice,
        'composite', // Mark as composite
        [...currentCompositeItem.entrees, ...currentCompositeItem.sides] // Include components for reference
    );

    // Reset the composite item
    currentCompositeItem = null;
    updateCurrentItemPreview();
    closePanel();
}


function selectDrink(drinkName) {
    selectedDrink = drinkName;
    selectedDrinkSize = 'sm'; // Reset size to small
    selectedQuantity = 1;

    // Update modal content
    document.getElementById('drinkName').innerText = drinkName;
    document.getElementById('drinkImage').src = `/Panda Express Photos/${drinkName}.png`;
    document.getElementById('quantity').innerText = selectedQuantity;

    // Check if it's Gatorade and handle size display
    if (drinkName === 'Gatorade Lemon Lime') {
        document.getElementById('smallSize').style.display = 'none';
        document.getElementById('mediumSize').style.display = 'none';
        document.getElementById('largeSize').style.display = 'none';
    } else if (drinkName === 'Aquafina') {
        // If it's Aquafina, adjust pricing and sizes dynamically
        document.getElementById('smallSize').innerHTML = `Small<br>$2.30`;
        document.getElementById('mediumSize').innerHTML = `Medium<br>$2.70`;
        document.getElementById('largeSize').innerHTML = `Large<br>$3.00`;

        document.getElementById('smallSize').style.display = 'inline-block';
        document.getElementById('mediumSize').style.display = 'inline-block';
        document.getElementById('largeSize').style.display = 'inline-block';
    } else {
        // Reset to default for fountain drinks
        document.getElementById('smallSize').innerHTML = `Small<br>$2.10`;
        document.getElementById('mediumSize').innerHTML = `Medium<br>$2.30`;
        document.getElementById('largeSize').innerHTML = `Large<br>$2.50`;

        document.getElementById('smallSize').style.display = 'inline-block';
        document.getElementById('mediumSize').style.display = 'inline-block';
        document.getElementById('largeSize').style.display = 'inline-block';
    }

    // Show the modal
    document.getElementById('drinkModal').style.display = 'block';
}


function closeDrinkModal() {
    document.getElementById('drinkModal').style.display = 'none';
    selectedDrink = null; // Reset selected drink
    selectedDrinkSize = 'sm'; // Reset size
    selectedQuantity = 1; // Reset quantity
}

function selectDrinkSize(size) {
    selectedDrinkSize = size;
    console.log("Selected size:", size);

    const sizeButtons = document.querySelectorAll('#sizeSelection .drink-size-button');
    sizeButtons.forEach((button) => {
        console.log("Checking button:", button.id);
        if (button.id === `${size}Size`) {
            button.classList.add('selected');
            console.log("Button turned green:", button.id);
        } else {
            button.classList.remove('selected');
        }
    });
}




function increaseQuantity() {
    selectedQuantity++;
    document.getElementById('quantity').innerText = selectedQuantity;
}

function decreaseQuantity() {
    if (selectedQuantity > 1) {
        selectedQuantity--;
        document.getElementById('quantity').innerText = selectedQuantity;
    }
}

function addDrinkToOrderFromModal() {
    let menuId;

    // Assign menu IDs based on the drink type and size
    if (selectedDrink === 'Gatorade Lemon Lime') {
        menuId = 68; // Gatorade always has a single menu ID
    } else if (selectedDrink === 'Aquafina') {
        // Fetch menu ID for water bottle based on selected size
        if (selectedDrinkSize === 'sm') {
            menuId = 64;
        } else if (selectedDrinkSize === 'md') {
            menuId = 65;
        } else if (selectedDrinkSize === 'lg') {
            menuId = 66;
        }
    } else {
        // Default to fountain drinks
        if (selectedDrinkSize === 'sm') {
            menuId = 61;
        } else if (selectedDrinkSize === 'md') {
            menuId = 62;
        } else if (selectedDrinkSize === 'lg') {
            menuId = 63;
        }
    }

    // Create the drink order item
    const drinkItem = {
        type: 'drink',
        name: selectedDrink,
        size: selectedDrink === 'Gatorade Lemon Lime' ? null : selectedDrinkSize, // No size for Gatorade
        price:
            selectedDrink === 'Gatorade Lemon Lime'
                ? 2.7
                : selectedDrink === 'Aquafina'
                ? selectedDrinkSize === 'sm'
                    ? 2.3
                    : selectedDrinkSize === 'md'
                    ? 2.7
                    : 3.0
                : selectedDrinkSize === 'sm'
                ? 2.1
                : selectedDrinkSize === 'md'
                ? 2.3
                : 2.5,
        quantity: selectedQuantity,
        menuIds: Array(selectedQuantity).fill(menuId), // Add menu ID multiple times based on quantity
    };

    // Add the drink item to the order
    orderItems.push(drinkItem);

    // Update the order list and total
    updateOrderList();
    calculateTotal();

    // Close the modal
    closeDrinkModal();
}


// Opens the modal for A La Carte item
function openAlaCarteModal(menuItem) {
    selectedAlaCarteItem = menuItem; // Store the selected item details
    alaCarteSize = 'md'; // Default to medium size
    alaCarteQuantity = 1; // Reset quantity

    // Normalize the `menuitem` for the image file name
    const normalizedMenuItem = camelCaseToNormal(menuItem.menuitem)

    // Update modal content
    document.getElementById('alaCarteImage').src = `/Panda Express Photos/${normalizedMenuItem}.png`;
    document.getElementById('alaCarteImage').alt = camelCaseToNormal(menuItem.menuitem);
    document.getElementById('alaCarteItemName').innerText = camelCaseToNormal(menuItem.menuitem);
    document.getElementById('alaCarteQuantity').innerText = alaCarteQuantity;

    // Show all size buttons for entrees
    if (menuItem.category === 'entree') {
        document.getElementById('smSize').style.display = 'inline-block'; // Show small size for entrees
        document.getElementById('mdSize').style.display = 'inline-block';
        document.getElementById('lgSize').style.display = 'inline-block';
    } 
    // Hide small size button for sides
    else if (menuItem.category === 'side') {
        document.getElementById('smSize').style.display = 'none'; // Hide small size for sides
        document.getElementById('mdSize').style.display = 'inline-block';
        document.getElementById('lgSize').style.display = 'inline-block';
    }

    document.getElementById('alaCarteModal').style.display = 'block'; // Show modal
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

    // Find the menu item in the global menuItems array
    const selectedMenuItem = menuItems.find(
        (item) =>
            item.menuitem === selectedAlaCarteItem.menuitem &&
            item.size === alaCarteSize
    );

    console.log(`Price for selected size: $${selectedMenuItem.price}`);
}




// Adjust quantity
function increaseAlaCarteQuantity() {
    alaCarteQuantity++;
    document.getElementById('alaCarteQuantity').innerText = alaCarteQuantity;
}

function decreaseAlaCarteQuantity() {
    if (alaCarteQuantity > 1) {
        alaCarteQuantity--;
        document.getElementById('alaCarteQuantity').innerText = alaCarteQuantity;
    }
}

function addAlaCarteItem(category, menuId, itemName, size, price) {
    console.log(`Adding A La Carte item: ${itemName}, Category: ${category}, Size: ${size}, Price: ${price}`);

    // Open the A La Carte modal with the selected item details
    openAlaCarteModal({
        category: category,
        menuitemid: menuId,
        menuitem: itemName,
        price: price
    });
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

    const { menuitemid: menuId, price } = selectedSizeData;

    // Create the order item
    const alaCarteOrder = {
        type: 'a la carte',
        name: `${camelCaseToNormal(selectedAlaCarteItem.menuitem)} (${capitalize(alaCarteSize)})`,
        size: alaCarteSize,
        price: price,
        quantity: alaCarteQuantity,
        menuIds: Array(alaCarteQuantity).fill(menuId),
    };

    // Add the item to the order
    orderItems.push(alaCarteOrder);

    // Update the order list and total
    updateOrderList();
    calculateTotal();

    // Close the modal
    closeAlaCarteModal();
}







function openAppetizerModal(appetizer) {
    selectedAppetizer = appetizer;
    appetizerSize = 'sm'; // Default size
    appetizerQuantity = 1; // Default quantity

    document.getElementById('appetizerImage').src = `/Panda Express Photos/${camelCaseToNormal(appetizer.menuitem)}.png`;
    document.getElementById('appetizerItemName').innerText = camelCaseToNormal(appetizer.displayname);
    document.getElementById('appetizerQuantity').innerText = appetizerQuantity;

    // Dynamically populate available sizes
    const sizeSelection = document.getElementById('appetizerSizeSelection');
    sizeSelection.innerHTML = ''; // Clear previous size buttons
    Object.entries(menuItemMap[appetizer.menuitem]).forEach(([size, data]) => {
        if (data) {
            const sizeButton = document.createElement('button');
            sizeButton.id = `${size}AppetizerSize`;
            sizeButton.classList.add('size-button');
            sizeButton.innerHTML = `${capitalize(size)}<br>$${data.price.toFixed(2)}`;
            sizeButton.onclick = () => selectAppetizerSize(size);
            sizeSelection.appendChild(sizeButton);
        }
    });

    document.getElementById('appetizerModal').style.display = 'block';
}


function closeAppetizerModal() {
    document.getElementById('appetizerModal').style.display = 'none';
    selectedAppetizer = null;
}

function selectAppetizerSize(size) {
    appetizerSize = size;
    const sizeButtons = document.querySelectorAll('#appetizerSizeSelection .size-button');
    sizeButtons.forEach(button => button.classList.remove('selected'));
    document.getElementById(`${size}AppetizerSize`).classList.add('selected');
}

function increaseAppetizerQuantity() {
    appetizerQuantity++;
    document.getElementById('appetizerQuantity').innerText = appetizerQuantity;
}

function decreaseAppetizerQuantity() {
    if (appetizerQuantity > 1) {
        appetizerQuantity--;
        document.getElementById('appetizerQuantity').innerText = appetizerQuantity;
    }
}

function addAppetizerToOrder() {
    if (!selectedAppetizer) {
        console.error("No appetizer selected.");
        return;
    }

    const sizeData = menuItemMap[selectedAppetizer.menuitem][appetizerSize];
    if (!sizeData) {
        console.error(`Size data for ${appetizerSize} not found.`);
        return;
    }

    const { menuitemid: menuId, price } = sizeData;

    const appetizerOrder = {
        type: 'appetizer',
        name: `${camelCaseToNormal(selectedAppetizer.displayname)} (${capitalize(appetizerSize)})`,
        size: appetizerSize,
        price: price,
        quantity: appetizerQuantity,
        menuIds: Array(appetizerQuantity).fill(menuId),
    };

    orderItems.push(appetizerOrder);
    updateOrderList();
    calculateTotal();
    closeAppetizerModal();
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
    totalAmount = orderItems.reduce((sum, item) => {
        const itemTotal = item.price * (item.quantity || 1);
        return sum + itemTotal;
    }, 0);

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


function checkoutOrder() {
    // Check if there are no items in the order
    if (orderItems.length === 0) {
        alert('Your order is empty. Please add items before checking out.');
        return; // Exit the function if order is empty
    }

    // Flatten the array of menuIds from each order item
    const menuItemIDs = orderItems.flatMap(item => item.menuIds); // Flatten array of menuIds

    // Show an alert with the menu IDs and total price
    alert(`Order Details:\nMenu IDs: ${menuItemIDs.join(', ')}\nTotal Price: $${totalAmount.toFixed(2)}`);

    // Clear the order
    clearOrder(); // Assuming clearOrder() resets the order and total
}


// function checkoutOrder() {
//     // Check if there are no items in the order
//     if (orderItems.length === 0) {
//         alert('Your order is empty. Please add items before checking out.');
//         return; // Exit the function if order is empty
//     }

//     // Flatten the array of menuIds from each order item
//     const menuItemIDs = orderItems.flatMap(item => item.menuIds); // Flatten array of menuIds

//     // Show an alert with the menu IDs and total price
//     alert(`Order Details:\nMenu IDs: ${menuItemIDs.join(', ')}\nTotal Price: $${totalAmount.toFixed(2)}`);

//     // Make the POST request to the server to update the pending order
//     fetch('/api/updatependingorders',
//     {
//         method: 'POST', // HTTP method for sending data
//         headers: { 'Content-Type': 'application/json' }, // Tell the server the data is in JSON format
//         body: JSON.stringify
//         ({
//             totalCost: totalAmount, // Send the total cost of the order (totalAmount is a global variable)
//             menuItemIDs: menuItemIDs, // Send the array of menu item IDs
//         })
//     })

//     .then(response =>
//     {
//         // If the response is not OK, throw an error to be caught in the catch block
//         if (!response.ok)
//         {
//             throw new Error('Failed to update pending order.');
//         }
//         return response.json(); // If the response is OK, parse the JSON response (which contains the server message from server.js)
//     })

//     .then(data =>
//     {
//         // Show a success message with the total cost and the server's response message
//         alert(`Pending order placed successfully!\nOrder total: $${totalAmount.toFixed(2)}\n${data.message}`);
//         clearOrder(); // Clear the order items after successful checkout
//     })

//     .catch(error =>
//     {
//         // Log and display an error message if something went wrong
//         console.error('Error:', error);
//         alert('An error occurred while placing your pending order. Please try again.');
//     });
// }

