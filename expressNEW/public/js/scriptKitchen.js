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
            order.dataset.status = "completed";
            completedContainer.appendChild(order);
            order.style.cursor = "default";

            const speechSynthesis = window.speechSynthesis;
            const name = order.dataset.name || "unknown customer";
            const text = `Order for ${name} is completed.`;
            const speech = new SpeechSynthesisUtterance(text);

            const selectedVoice = voices.find((voice) => voice.name.includes("Google 國語（臺灣）")) || voices[0];
            if (selectedVoice) {
                speech.voice = selectedVoice;
            }

            speechSynthesis.speak(speech);

            const menuItemIDs = JSON.parse(order.dataset.menuItemIDs); // Convert back to an array
            const totalCost = parseFloat(order.dataset.totalCost);

            console.log("Menu Item IDs:", menuItemIDs);
            console.log("Total Cost:", totalCost);

            await updateOrder(totalCost, menuItemIDs);
            await updateInventory(menuItemIDs);

            setTimeout(() => {
                if (order.parentElement === completedContainer) {
                    order.remove();
                }
            }, 300000); // 5 minutes
        }
    });

    completedContainer.addEventListener("click", (e) => {
        const order = e.target.closest(".orderCard");
        if (order && order.dataset.status === "completed") {
            order.remove();
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
            orderCard.dataset.menuItemIDs = JSON.stringify(order.menuitemids);
            orderCard.dataset.totalCost = order.totalcost;
            orderCard.dataset.name = order.name;

            // Use the `date` field from the pending orders as the starting timestamp
            const orderTimestamp = order.date ? new Date(order.date) : new Date();
            orderCard.dataset.startTime = orderTimestamp.getTime();

            const orderTitle = document.createElement("h3");
            orderTitle.textContent = `Order for ${order.name}`;

            const orderList = document.createElement("div");
            orderList.classList.add("order-list");

            const items = order.menuitemids.slice(1, -1).split(',').map((item) => item.trim());

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
                    i += 4;
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
                    i += 5;
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
                    i += 6;
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

function startTimer(orderCard, timerElement) {
    const startTime = parseInt(orderCard.dataset.startTime, 10);

    const updateTimer = () => {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000); // Elapsed time in seconds

        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

        // Update card color based on elapsed time
        if (elapsedTime >= 300) {
            orderCard.style.backgroundColor = "#FF6347"; // Red after 5 minutes
        } else if (elapsedTime >= 180) {
            orderCard.style.backgroundColor = "#FFD700"; // Yellow after 3 minutes
        } else {
            orderCard.style.backgroundColor = "#32CD32"; // Green at the start
        }
    };

    // Update the timer every second
    setInterval(updateTimer, 1000);
}

async function updateOrder(totalCost, menuItemIDs) {
    try {
        const response = await fetch('/api/updateorders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ totalCost, menuItemIDs }),
        });
        console.log('Order updated:', await response.json());
    } catch (error) {
        console.error('Error updating order:', error);
    }
}

async function updateInventory(menuItemIDs) {
    try {
        const response = await fetch('/api/updateinventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menuItemIDs }),
        });
        console.log('Inventory updated:', await response.json());
    } catch (error) {
        console.error('Error updating inventory:', error);
    }
}
