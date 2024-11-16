// Initialize order and total amount
let orderItems = [];
let totalAmount = 0;

// Load menu items dynamically from the server
async function loadMenuItems() {
    try {
        const response = await fetch('/api/menuitems');
        if (!response.ok) {
            console.error('Failed to fetch menu items:', response.statusText);
            return;
        }

        const menuItems = await response.json();
        console.log('Fetched Menu Items:', menuItems);

        // Populate menu items into respective containers
        populateMenuItems(menuItems);
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

// Populate menu items into the appropriate containers
function populateMenuItems(menuItems) {
    const containers = {
        entree: document.getElementById('entree-buttons'),
        side: document.getElementById('side-buttons'),
        appetizer: document.getElementById('appetizer-buttons'),
        drink: document.getElementById('drink-buttons'),
        smallEntree: document.getElementById('small-entree-buttons'),
        smallSide: document.getElementById('small-side-buttons'),
        mediumEntree: document.getElementById('medium-entree-buttons'),
        mediumSide: document.getElementById('medium-side-buttons'),
        largeEntree: document.getElementById('large-entree-buttons'),
        largeSide: document.getElementById('large-side-buttons'),
    };

    for (const [key, container] of Object.entries(containers)) {
        if (!container) console.error(`${key} container not found`);
    }

    menuItems.forEach(item => {
        const targetContainer = getTargetContainer(item, containers);
        if (targetContainer) {
            const button = createMenuItemButton(item);
            targetContainer.appendChild(button);
        }
    });
}

// Get the appropriate container based on item properties
function getTargetContainer(item, containers) {
    if (item.size === 'sm') {
        if (item.type === 'entree') return containers.smallEntree;
        if (item.type === 'side') return containers.smallSide;
    } else if (item.size === 'md') {
        if (item.type === 'entree') return containers.mediumEntree;
        if (item.type === 'side') return containers.mediumSide;
    } else if (item.size === 'lg') {
        if (item.type === 'entree') return containers.largeEntree;
        if (item.type === 'side') return containers.largeSide;
    } else if (item.type === 'appetizer') {
        return containers.appetizer;
    } else if (item.type === 'drink') {
        return containers.drink;
    }
    return null; // No matching container found
}

// Create a button for a menu item
function createMenuItemButton(item) {
    const button = document.createElement('button');
    button.classList.add('menu-item-button');
    button.innerHTML = `
        <img src="/Panda Express Photos/${item.menuitem.replace(/ /g, "")}.png" alt="${item.menuitem}">
        <span>${camelCaseToNormal(item.menuitem)} ($${item.price.toFixed(2)})</span>
    `;
    button.onclick = () => addItemToOrder(item.menuitem, item.price);
    return button;
}

// Add item to order
function addItemToOrder(itemName, price) {
    orderItems.push({ name: itemName, price });
    updateOrderList();
    calculateTotal();

    // Show feedback for adding the item
    showFeedback(`${itemName} added to your order!`);
}

// Update the order list UI
function updateOrderList() {
    const orderList = document.getElementById("orderItems");
    orderList.innerHTML = ""; // Clear the current list

    orderItems.forEach((item, index) => {
        const listItem = document.createElement("div");
        listItem.className = "order-item";
        listItem.innerHTML = `
            <span>${item.name} - $${item.price.toFixed(2)}</span>
            <button onclick="removeItem(${index})">Remove</button>
        `;
        orderList.appendChild(listItem);
    });
}

// Remove item from order
function removeItem(index) {
    orderItems.splice(index, 1);
    updateOrderList();
    calculateTotal();
}

// Calculate total order amount
function calculateTotal() {
    totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);
    document.getElementById("totalAmount").textContent = totalAmount.toFixed(2);
}

// Checkout action
function goToCheckout() {
    if (orderItems.length === 0) {
        alert("Your order is empty. Please add items before checking out.");
        return;
    }

    alert(`Your total is $${totalAmount.toFixed(2)}. Proceeding to checkout.`);
    orderItems = [];
    updateOrderList();
    calculateTotal();
}

// Show feedback for adding an item
function showFeedback(message) {
    const feedback = document.createElement("div");
    feedback.classList.add("feedback-popup");
    feedback.innerText = message;

    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Show the selected panel
function showPanel(panelId) {
    const panels = document.querySelectorAll(".kiosk-panel");
    panels.forEach((panel) => panel.classList.add("hidden"));

    const selectedPanel = document.getElementById(panelId);
    selectedPanel.classList.remove("hidden");
}

// Helper function to convert camelCase to normal text
function camelCaseToNormal(camelCaseString) {
    return camelCaseString
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, str => str.toUpperCase());
}

// Initialize the page
window.onload = loadMenuItems;
