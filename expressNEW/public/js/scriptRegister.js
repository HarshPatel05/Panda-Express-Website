let orderItems = [];
let currentCompositeItem = null;
let totalAmount = 0;
let currentSize = null;

// Load and display menu items as buttons
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

        menuItems.forEach((item, index) => {
            // Check if item should be added (every third item)
            if (item.menuitemid >= 1 && item.menuitemid <= 39 && index % 3 !== 0) return; // Skip to get first of each three for entrees
            if (item.menuitemid >= 40 && item.menuitemid <= 51 && index % 3 !== 0) return; // Skip to get first of each three for sides

            const button = document.createElement('button');
            button.innerText = `${item.menuitem} (${item.size}) - $${item.price.toFixed(2)}`;
            button.classList.add('menu-item-button');

            if (item.menuitemid >= 1 && item.menuitemid <= 39) {
                button.onclick = () => addComponentToCurrentOrder('entree', item.menuitem);
                entreeContainer.appendChild(button);
            } else if (item.menuitemid >= 40 && item.menuitemid <= 51) {
                button.onclick = () => addComponentToCurrentOrder('side', item.menuitem);
                sideContainer.appendChild(button);
            } else if (item.menuitemid >= 52 && item.menuitemid <= 60) {
                button.onclick = () => addAppetizerToOrder(item.menuitem, item.price);
                appetizerContainer.appendChild(button);
            } else if (item.menuitemid >= 61 && item.menuitemid <= 68) {
                button.onclick = () => addDrinkToOrder(item.menuitem, item.price, item.size);
                drinkContainer.appendChild(button);
            }
        });
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}


document.addEventListener('DOMContentLoaded', loadMenuItems);

// Function to initialize a new composite item (bowl, plate, or bigger plate)
function selectItemType(type, price, entreesRequired, sidesRequired) {
    currentCompositeItem = {
        type: type,
        name: capitalize(type),
        price: price,
        entreesRequired: entreesRequired,
        sidesRequired: sidesRequired,
        entrees: [],
        sides: []
    };
    updateCurrentItemPreview();
    openPanel('hiddenPanelMain');
}

// Function to add a component (entree or side) to the current composite item
function addComponentToCurrentOrder(category, itemName) {
    if (!currentCompositeItem) return;

    // Add entrees or sides to the current composite item based on the category
    if (category === 'entree' && currentCompositeItem.entrees.length < currentCompositeItem.entreesRequired) {
        currentCompositeItem.entrees.push(itemName);
    } else if (category === 'side' && currentCompositeItem.sides.length < currentCompositeItem.sidesRequired) {
        currentCompositeItem.sides.push(itemName);
    }

    updateCurrentItemPreview();

    // Check if the current composite item is complete
    const isComplete = currentCompositeItem.entrees.length === currentCompositeItem.entreesRequired &&
                       currentCompositeItem.sides.length === currentCompositeItem.sidesRequired;

    if (isComplete) {
        addItemToOrder(currentCompositeItem);
        currentCompositeItem = null;
        updateCurrentItemPreview(); // Clear preview
        closePanel();
    }
}

// Add a completed composite item to the order
function addItemToOrder(item) {
    orderItems.push(item);
    updateOrderList();
    calculateTotal();
    closePanel(); // Close the panel after adding the item
    document.getElementById('main-buttons').style.display = 'grid'; // Show main panel
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

// Update preview for the current composite item
function updateCurrentItemPreview() {
    const preview = document.getElementById("currentItemPreview");
    if (!currentCompositeItem) {
        preview.innerHTML = "";
        return;
    }

    let previewHTML = `<strong>${currentCompositeItem.name} +$${currentCompositeItem.price.toFixed(2)}</strong><br>`;
    previewHTML += "<div class='item-components'>";
    previewHTML += currentCompositeItem.entrees.map(entree => `<div>- ${entree}</div>`).join('');
    previewHTML += currentCompositeItem.sides.map(side => `<div>- ${side}</div>`).join('');
    previewHTML += "</div>";

    preview.innerHTML = previewHTML;
}

// Functions to update the order list, calculate the total, and manage panels
function updateOrderList() {
    const orderList = document.getElementById("orderList");
    orderList.innerHTML = "";
    orderItems.forEach((item, index) => {
        const listItem = document.createElement("div");
        listItem.classList.add("order-item");
        listItem.innerHTML = `
            ${capitalize(item.name)} +$${item.price.toFixed(2)}
            <div class="item-components">
                ${item.entrees ? item.entrees.map(entree => `<div>- ${entree}</div>`).join('') : ''}
                ${item.sides ? item.sides.map(side => `<div>- ${side}</div>`).join('') : ''}
            </div>
            <button onclick="removeItemFromOrder(${index})">Remove</button>
        `;
        orderList.appendChild(listItem);
    });
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

function checkoutOrder() {
    alert(`Order total is $${totalAmount.toFixed(2)}. Proceeding to checkout...`);
    clearOrder();
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
