let orderItems = [];
let currentCompositeItem = null;
let totalAmount = 0;
let selectedSize = 'Medium'; // Default size for A La Carte
let currentAlaCarteItem = null;

// Utility Functions
const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);
const camelCaseToNormal = str =>
    str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, s => s.toUpperCase());
const getFullSizeName = abbreviation => {
    const sizeMap = { sm: "Small", md: "Medium", lg: "Large" };
    return sizeMap[abbreviation.toLowerCase()] || abbreviation;
};

// Load Menu Items
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

// Populate Menu Buttons
function populateMenuButtons(menuItems) {
    const panelMap = {
        bowl: 'bowl-items',
        plate: 'plate-items',
        biggerPlate: 'bigger-plate-items',
        aLaCarte: 'a-la-carte-items',
        appetizers: 'appetizers-items',
        drinks: 'drinks-items',
    };

    menuItems.forEach(item => {
        const panelId = panelMap[item.category];
        if (!panelId) return;

        const panel = document.getElementById(panelId);
        const button = document.createElement('button');
        button.classList.add('menu-item-button');
        button.innerText = `${camelCaseToNormal(item.menuitem)} (${getFullSizeName(item.size)}) - $${item.price.toFixed(2)}`;
        button.onclick = () => handleItemClick(item);
        panel.appendChild(button);
    });
}

// Handle Item Click
function handleItemClick(item) {
    if (currentCompositeItem) {
        addComponentToCurrentOrder(item);
    } else {
        addItemToOrder(item);
    }
}

// Add Item to Order
function addItemToOrder(item) {
    const orderItem = {
        menuIds: [item.menuitemid],
        name: camelCaseToNormal(item.menuitem),
        price: item.price,
        type: item.category,
    };
    orderItems.push(orderItem);
    updateOrderSummary();
}

// Add Component to Current Composite Order
function addComponentToCurrentOrder(item) {
    const category = item.category;
    const currentList = currentCompositeItem[category];
    const limit = currentCompositeItem[`${category}Limit`];

    if (currentList.length < limit) {
        currentList.push(item);
        updateOrderSummary();
    } else {
        alert(`You can only add up to ${limit} ${category} items.`);
    }

    if (isCompositeComplete()) finalizeCompositeOrder();
}

// Check if Composite is Complete
function isCompositeComplete() {
    const { entrees, sides, entreeLimit, sideLimit } = currentCompositeItem;
    return entrees.length === entreeLimit && sides.length === sideLimit;
}

// Finalize Composite Order
function finalizeCompositeOrder() {
    const { menuId, name, price, entrees, sides } = currentCompositeItem;

    const compositeItem = {
        menuIds: [menuId, ...entrees.map(e => e.menuitemid), ...sides.map(s => s.menuitemid)],
        name,
        price,
        type: 'composite',
        components: [...entrees, ...sides],
    };

    orderItems.push(compositeItem);
    currentCompositeItem = null;
    updateOrderSummary();
}

// Update Order Summary
function updateOrderSummary() {
    const orderList = document.getElementById('orderItems');
    orderList.innerHTML = '';

    orderItems.forEach((item, index) => {
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order-item');
        orderDiv.innerHTML = `
            <strong>${item.name}</strong> - $${item.price.toFixed(2)}
            ${item.components
                ? item.components.map(c => `<div class="sub-item">- ${camelCaseToNormal(c.menuitem)}</div>`).join('')
                : ''}
            <button onclick="removeItemFromOrder(${index})">Remove</button>
        `;
        orderList.appendChild(orderDiv);
    });

    totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('totalAmount').innerText = totalAmount.toFixed(2);
}

// Remove Item from Order
function removeItemFromOrder(index) {
    if (index >= 0 && index < orderItems.length) {
        orderItems.splice(index, 1);
        updateOrderSummary();
    }
}

// Checkout Order
function checkoutOrder() {
    if (!orderItems.length) {
        alert('No items to checkout.');
        return;
    }

    const payload = {
        totalCost: totalAmount,
        menuItemIDs: orderItems.flatMap(item => item.menuIds),
    };

    fetch('/api/updateorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to process order.');
            return response.json();
        })
        .then(data => {
            alert(`Order placed! Total: $${totalAmount.toFixed(2)}\n${data.message}`);
            clearOrder();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Checkout failed. Try again.');
        });
}

// Clear Order
function clearOrder() {
    orderItems = [];
    currentCompositeItem = null;
    totalAmount = 0;
    updateOrderSummary();
    showPanel('mainPanel');
}

// Composite Item Initialization
function selectItemType(type, price, entreeLimit, sideLimit, menuId) {
    currentCompositeItem = {
        type,
        name: capitalize(type),
        price,
        menuId,
        entreeLimit,
        sideLimit,
        entrees: [],
        sides: [],
    };
    showPanel(`${type}Panel`);
}

// Panel Navigation
function showPanel(panelId) {
    document.querySelectorAll('.kiosk-panel').forEach(panel => panel.classList.add('hidden'));
    document.getElementById(panelId).classList.remove('hidden');
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    showPanel('mainPanel');
});
