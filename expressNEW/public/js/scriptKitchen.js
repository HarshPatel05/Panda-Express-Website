let menuItemDetails = {}; // Global variable to store menu item details

async function fetchMenuItemDetails() {
    try {
        const response = await fetch('/api/menuitems');
        if (!response.ok) {
            throw new Error('Failed to fetch menu item details');
        }
        const menuItems = await response.json();
        menuItems.forEach(item => {
            menuItemDetails[item.menuitemid] = {
                name: item.menuitem,
                size: item.size || "N/A", // Use "N/A" if size is not provided
                price: item.price,
            };
        });
    } catch (error) {
        console.error('Error fetching menu item details:', error);
    }
}

function convertCamelCaseToReadable(text) {
    if (!text) return "";
    return text
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (str) => str.toUpperCase());
}

function formatWithSize(name, size) {
    const sizeMapping = {
        sm: "Small",
        md: "Medium",
        lg: "Large",
    };

    const formattedSize = sizeMapping[size.toLowerCase()] || size.charAt(0).toUpperCase() + size.slice(1).toLowerCase();
    return formattedSize === "N/A" ? convertCamelCaseToReadable(name) : `${formattedSize} ${convertCamelCaseToReadable(name)}`;
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetchMenuItemDetails(); // Fetch menu item details before loading orders
    await loadPendingOrders();

    const inProgressContainer = document.querySelector("#inProgress .orderContainer");
    const completedContainer = document.querySelector("#completed .orderContainer");

    let voices = [];

    // Load available voices
    const loadVoices = () => {
        voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    } else {
        loadVoices();
    }

    inProgressContainer.addEventListener("click", async (e) => {
        const order = e.target.closest(".orderCard");
        if (order && order.dataset.status === "in-progress") {
            // Move order to "completed"
            order.dataset.status = "completed";
            completedContainer.appendChild(order);
            order.style.cursor = "default";

            // Update styles for completed orders
            const orderTitle = order.querySelector("h3");
            const timerElement = order.querySelector(".timer");

            order.style.backgroundColor = "white"; // Set background to white
            order.style.borderColor = "green"; // Optional: Add green border
            orderTitle.style.color = "green"; // Set name to green

            if (timerElement) {
                timerElement.remove(); // Remove the timer
            }

            // Play the announcement
            const speechSynthesis = window.speechSynthesis;
            const name = order.dataset.name || "unknown customer";
            const text = `Order for ${name} is completed.`;
            const speech = new SpeechSynthesisUtterance(text);

            const selectedVoice = voices.find((voice) => voice.name.includes("Google 國語（臺灣）")) || voices[0];
            if (selectedVoice) {
                speech.voice = selectedVoice;
            }

            speechSynthesis.speak(speech);

            // Checkout the order
            const menuItemIDs = JSON.parse(order.dataset.menuItemIDs); // Parse the menuItemIDs into an array
            const totalCost = parseFloat(order.dataset.totalCost);
            const pendingOrderID = order.dataset.pendingOrderID; // Extract the pending order ID

            console.log("Checking out order:", menuItemIDs, "Total cost:", totalCost);

            await checkoutOrder(totalCost, menuItemIDs, pendingOrderID);

            // Remove the order after 5 minutes
            setTimeout(() => {
                if (order.parentElement === completedContainer) {
                    order.remove();
                }
            }, 300000); // 5 minutes
        }
    });

    // Real-time update check every 30 seconds
    setInterval(async () => {
        await loadPendingOrders();
    }, 30000);
});


async function loadPendingOrders() {
    const inProgressContainer = document.querySelector("#inProgress .orderContainer");

    try {
        const response = await fetch('/api/getpendingorders');
        if (!response.ok) {
            throw new Error(`Failed to fetch Pending Orders: ${response.statusText}`);
        }

        const pendingOrders = await response.json();
        console.log('Fetched Pending Orders (Kitchen):', pendingOrders);

        inProgressContainer.innerHTML = ''; // Clear existing orders

        for (const order of pendingOrders) {
            const orderCard = document.createElement("div");
            orderCard.classList.add("orderCard");
            orderCard.dataset.status = "in-progress";
            orderCard.dataset.menuItemIDs = JSON.stringify(convertToArray(order.menuitemids));
            orderCard.dataset.totalCost = order.totalcost;
            orderCard.dataset.name = order.name;
            orderCard.dataset.pendingOrderID = order.pendingorderid; // Store pending order ID

            const orderTimestamp = order.date ? new Date(order.date) : new Date();
            orderCard.dataset.startTime = orderTimestamp.getTime();

            const orderTitle = document.createElement("h3");
            orderTitle.textContent = `Order for ${order.name}`;

            const orderList = document.createElement("div");
            orderList.classList.add("order-list");

            const items = convertToArray(order.menuitemids);

            let i = 0;
            while (i < items.length) {
                const itemId = items[i];
                const itemDetails = menuItemDetails[itemId];

                if (!itemDetails) {
                    console.warn(`No details found for menuItemId: ${itemId}`);
                    i++;
                    continue;
                }

                if (itemDetails.name.toLowerCase().includes("bowl")) {
                    const bowlItem = document.createElement("div");
                    bowlItem.textContent = `Bowl`;
                    const bowlList = document.createElement("ul");

                    for (let j = 1; j <= 3 && i + j < items.length; j++) {
                        const subItemId = items[i + j];
                        const subItemDetails = menuItemDetails[subItemId];
                        const subListItem = document.createElement("li");
                        subListItem.textContent = subItemDetails
                            ? convertCamelCaseToReadable(subItemDetails.name)
                            : `Unknown item`;
                        bowlList.appendChild(subListItem);
                    }

                    bowlItem.appendChild(bowlList);
                    orderList.appendChild(bowlItem);
                    i += 4; // Skip the bowl and its 3 items
                } else if (itemDetails.name.toLowerCase().includes("plate") && !itemDetails.name.toLowerCase().includes("bigger")) {
                    const plateItem = document.createElement("div");
                    plateItem.textContent = `Plate`;
                    const plateList = document.createElement("ul");

                    for (let j = 1; j <= 4 && i + j < items.length; j++) {
                        const subItemId = items[i + j];
                        const subItemDetails = menuItemDetails[subItemId];
                        const subListItem = document.createElement("li");
                        subListItem.textContent = subItemDetails
                            ? convertCamelCaseToReadable(subItemDetails.name)
                            : `Unknown item`;
                        plateList.appendChild(subListItem);
                    }

                    plateItem.appendChild(plateList);
                    orderList.appendChild(plateItem);
                    i += 5; // Skip the plate and its 4 items
                } else if (itemDetails.name.toLowerCase().includes("bigger plate")) {
                    const biggerPlateItem = document.createElement("div");
                    biggerPlateItem.textContent = `Bigger Plate`;
                    const biggerPlateList = document.createElement("ul");

                    for (let j = 1; j <= 5 && i + j < items.length; j++) {
                        const subItemId = items[i + j];
                        const subItemDetails = menuItemDetails[subItemId];
                        const subListItem = document.createElement("li");
                        subListItem.textContent = subItemDetails
                            ? convertCamelCaseToReadable(subItemDetails.name)
                            : `Unknown item`;
                        biggerPlateList.appendChild(subListItem);
                    }

                    biggerPlateItem.appendChild(biggerPlateList);
                    orderList.appendChild(biggerPlateItem);
                    i += 6; // Skip the bigger plate and its 5 items
                } else {
                    const singleItem = document.createElement("div");
                    singleItem.textContent = formatWithSize(itemDetails.name, itemDetails.size);
                    orderList.appendChild(singleItem);
                    i++;
                }
            }

            orderCard.appendChild(orderTitle);
            orderCard.appendChild(orderList);

            const timer = document.createElement("p");
            timer.classList.add("timer");
            timer.textContent = "Time: 0:00"; // Initial timer display
            orderCard.appendChild(timer);

            inProgressContainer.appendChild(orderCard);

            // Start the timer
            startTimer(orderCard, timer);
        }
    } catch (error) {
        console.error('Error loading pending orders:', error);
    }
}

function convertToArray(menuitemids) {
    if (typeof menuitemids === "string") {
        return menuitemids.replace(/[{}[\]]/g, '').split(',').map(id => parseInt(id.trim(), 10));
    }
    return menuitemids; // If already an array, return as is
}

function startTimer(orderCard, timerElement) {
    const startTime = parseInt(orderCard.dataset.startTime, 10);

    const updateTimer = () => {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000); // Elapsed time in seconds

        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;

        // Only update the timer if it exists
        if (timerElement) {
            timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        }

        // Update card color based on elapsed time (only for in-progress orders)
        if (orderCard.dataset.status === "in-progress") {
            if (elapsedTime >= 300) {
                orderCard.style.backgroundColor = "#FF6347"; // Red after 5 minutes
            } else if (elapsedTime >= 180) {
                orderCard.style.backgroundColor = "#FFD700"; // Yellow after 3 minutes
            } else {
                orderCard.style.backgroundColor = "#32CD32"; // Green at the start
            }
        }
    };

    // Update the timer every second
    setInterval(updateTimer, 1000);
}


async function checkoutOrder(totalCost, menuItemIDs, pendingOrderID) {
    try {
        const response = await fetch('/api/updateorders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ totalCost, menuItemIDs }),
        });

        if (!response.ok) {
            throw new Error('Failed to update order.');
        }

        console.log('Order successfully checked out:', await response.json());

        await updateInventory(menuItemIDs); // Update inventory after successful checkout

        // Delete the pending order
        await deletePendingOrder(pendingOrderID);

    } catch (error) {
        console.error('Error during checkout:', error);
    }
}

async function deletePendingOrder(pendingOrderID) {
    try {
        const response = await fetch(`/api/deletependingorder/${pendingOrderID}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete pending order.');
        }

        console.log(`Pending order ${pendingOrderID} deleted successfully.`);
    } catch (error) {
        console.error('Error deleting pending order:', error);
    }
}

async function updateInventory(menuItemIDs) {
    try {
        const response = await fetch('/api/updateinventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menuItemIDs }),
        });

        if (!response.ok) {
            throw new Error('Failed to update inventory.');
        }

        console.log('Inventory successfully updated:', await response.json());
    } catch (error) {
        console.error('Error updating inventory:', error);
    }
}
