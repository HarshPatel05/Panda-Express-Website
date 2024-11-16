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

        // Populate entrees and sides
        populateMenuItems(menuItems);
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

// Populate entrees and sides
function populateMenuItems(menuItems) {
    const entreeContainer = document.getElementById('entree-buttons');
    const sideContainer = document.getElementById('side-buttons');

    if (!entreeContainer || !sideContainer) {
        console.error("Entree or Side container not found");
        return;
    }

    // Clear existing items
    entreeContainer.innerHTML = '';
    sideContainer.innerHTML = '';

    menuItems.forEach(item => {
        const button = document.createElement('button');
        button.classList.add('menu-item-button');
        button.innerText = `${camelCaseToNormal(item.menuitem)} ($${item.price.toFixed(2)})`;
        button.onclick = () => addItemToOrder(item.menuitem, item.price);

        // Categorize into entrees or sides based on `item.type`
        if (item.type === 'entree') {
            entreeContainer.appendChild(button);
        } else if (item.type === 'side') {
            sideContainer.appendChild(button);
        }
    });
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

// Utility function to create buttons
function createMenuItemButton(item, onClickHandler) {
    const button = document.createElement("button");
    button.classList.add("item-button");
    button.innerHTML = `
        <img src="/Panda Express Photos/${item.name.replace(/ /g, "")}.png" alt="${item.name}">
        <span>${item.name} - $${item.price.toFixed(2)}</span>
    `;
    button.onclick = onClickHandler;
    return button;
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
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add a space before each uppercase letter
        .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter
}

// Updated populatePanel function to use unique IDs
function populatePanel(panelId, itemsGridId, category) {
    const panel = document.getElementById(panelId);
    const itemsGrid = document.getElementById(itemsGridId);

    if (!panel || !itemsGrid) {
        console.error(`Panel or items grid not found for panelId: ${panelId}`);
        return;
    }

    itemsGrid.innerHTML = ""; // Clear previous items

    const categoryData = menuData[category];
    if (!categoryData) {
        console.error(`Category "${category}" not found in menuData.`);
        return;
    }

    for (const type in categoryData) {
        categoryData[type].forEach(item => {
            const button = createMenuItemButton(item, () => addItemToOrder(item.name, item.price));
            itemsGrid.appendChild(button);
        });
    }
}

// Populate all panels during setup
window.onload = () => {
    loadMenuItems(); // Load dynamic menu items
    populatePanel("bowlPanel", "bowl-items", "bowl");
    populatePanel("platePanel", "plate-items", "plate");
    populatePanel("biggerPlatePanel", "bigger-plate-items", "biggerPlate");
    populatePanel("aLaCartePanel", "a-la-carte-items", "aLaCarte");
    populatePanel("appetizersPanel", "appetizers-items", "appetizers");
    populatePanel("drinksPanel", "drinks-items", "drinks");
};
