let orderItems = [];
let totalAmount = 0;

function openCategory(category) {
    // Load category items dynamically
    loadCategoryItems(category);
}

function loadCategoryItems(category) {
    // Replace this with API call or dynamic content fetching
    const items = getCategoryItems(category);

    const categoryPanel = document.createElement("div");
    categoryPanel.className = "category-panel";

    items.forEach((item) => {
        const button = document.createElement("button");
        button.className = "item-button";
        button.innerHTML = `
            <img src="/images/items/${item.image}" alt="${item.name}">
            <span>${item.name} - $${item.price.toFixed(2)}</span>
        `;
        button.onclick = () => addItemToOrder(item);
        categoryPanel.appendChild(button);
    });

    document.body.appendChild(categoryPanel);
}

function addItemToOrder(item) {
    // Add item to the order
    orderItems.push(item);
    updateOrderList();
    calculateTotal();
}

function updateOrderList() {
    const orderList = document.getElementById("orderItems");
    orderList.innerHTML = ""; // Clear the current list

    orderItems.forEach((item, index) => {
        const listItem = document.createElement("div");
        listItem.className = "order-item";
        listItem.innerHTML = `
            ${item.name} - $${item.price.toFixed(2)}
            <button onclick="removeItem(${index})">Remove</button>
        `;
        orderList.appendChild(listItem);
    });
}

function removeItem(index) {
    orderItems.splice(index, 1);
    updateOrderList();
    calculateTotal();
}

function calculateTotal() {
    totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);
    document.getElementById("totalAmount").textContent = totalAmount.toFixed(2);
}

function goToCheckout() {
    alert(`Your total is $${totalAmount.toFixed(2)}. Proceeding to checkout.`);
    orderItems = [];
    updateOrderList();
    calculateTotal();
}
