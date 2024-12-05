let menuItemDetails = {}; // Global variable to store menu item details

/**
 * Fetches menu item details from the API and populates the `menuItemDetails` object.
 * Each menu item is stored using its `menuitemid` as the key.
 * @async
 */
async function fetchMenuItemDetails() {
    try {
        const response = await fetch('/api/menuitems');
        if (!response.ok) {
            throw new Error('Failed to fetch menu item details');
        }

        const menuItems = await response.json();

        // Populate the global `menuItemDetails` object
        menuItems.forEach(item => {
            menuItemDetails[item.menuitemid] = {
                name: item.menuitem,
                size: item.size || "N/A", // Default to "N/A" if no size is provided
                price: item.price,
            };
        });
    } catch (error) {
        console.error('Error fetching menu item details:', error);
    }
}

/**
 * Converts camelCase text to a readable format.
 * Example: "camelCaseText" -> "Camel Case Text".
 * @param {string} text - The camelCase string to convert.
 * @returns {string} - The converted readable string.
 */
function convertCamelCaseToReadable(text) {
    if (!text) return "";
    return text
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before uppercase letters
        .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
}

/**
 * Formats a menu item name with its size.
 * If size is "N/A", it returns only the readable name.
 * @param {string} name - The name of the menu item in camelCase.
 * @param {string} size - The size abbreviation (e.g., "sm", "md", "lg").
 * @returns {string} - The formatted string with size and name.
 */
function formatWithSize(name, size) {
    const sizeMapping = {
        sm: "Small",
        md: "Medium",
        lg: "Large",
    };

    // Get the full size name or capitalize a custom size
    const formattedSize = sizeMapping[size.toLowerCase()] || size.charAt(0).toUpperCase() + size.slice(1).toLowerCase();

    // If size is "N/A", return only the readable name
    return formattedSize === "N/A" ? convertCamelCaseToReadable(name) : `${formattedSize} ${convertCamelCaseToReadable(name)}`;
}

/**
 * Fetches and plays audio generated from the given text.
 * The function interacts with an API to generate audio and plays it in the browser.
 * @async
 * @param {string} text - The text to convert into audio.
 */
const playAudioFromAPI = async (text) => {
    try {
        // Fetch the audio data from the API
        const response = await fetch(`/api/generate-audio?text=${encodeURIComponent(text)}`);
        if (!response.ok) throw new Error('Failed to fetch audio');
        
        // Convert the response into a Blob and create a temporary audio URL
        const blob = await response.blob();
        const audioURL = URL.createObjectURL(blob);
        
        // Create an audio object and play the generated audio
        const audio = new Audio(audioURL);
        audio.play();
    } catch (error) {
        // Log any errors that occur during the process
        console.error('Error playing audio:', error);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    // Fetch initial data: menu item details and pending orders
    await fetchMenuItemDetails(); // Fetch menu item details before loading orders
    await loadPendingOrders(); // Load orders that are pending

    // Select containers for orders in progress and completed orders
    const inProgressContainer = document.querySelector("#inProgress .orderContainer");
    const completedContainer = document.querySelector("#completed .orderContainer");

    let voices = [];

    // Load available voices for speech synthesis
    const loadVoices = () => {
        voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);
    };

    // Listen for voice changes or load voices immediately
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    } else {
        loadVoices();
    }

    // Event listener for "in-progress" order clicks
    inProgressContainer.addEventListener("click", async (e) => {
        const order = e.target.closest(".orderCard"); // Get the clicked order card
        if (order && order.dataset.status === "in-progress") {
            // Move the order to "completed" status
            order.dataset.status = "completed";
            completedContainer.appendChild(order); // Move order to the completed section
            order.style.cursor = "default";

            // Update visual styles for completed orders
            const orderTitle = order.querySelector("h3");
            const timerElement = order.querySelector(".timer");

            order.style.backgroundColor = "white"; // Set background color
            order.style.borderColor = "green"; // Optional: Add a green border
            orderTitle.style.color = "green"; // Set title text color to green

            if (timerElement) {
                timerElement.remove(); // Remove the timer if it exists
            }

            // Announce the completed order
            const speechSynthesis = window.speechSynthesis;
            const name = order.dataset.name || "unknown customer"; // Default to "unknown customer" if no name
            const text = `Order for ${name} is completed.`;
            const speech = new SpeechSynthesisUtterance(text);

            // Select a voice (default to the first voice if specific one is unavailable)
            const selectedVoice = voices.find((voice) => voice.name.includes("Google 國語（臺灣）")) || voices[0];
            if (selectedVoice) {
                speech.voice = selectedVoice;
            }

            // Uncomment this to use speech synthesis
            // speechSynthesis.speak(speech);

            // AI Zone for playing audio via API (uncomment to enable)
            playAudioFromAPI(text);

            // Process the completed order for checkout
            const menuItemIDs = JSON.parse(order.dataset.menuItemIDs); // Convert menu item IDs to array
            const totalCost = parseFloat(order.dataset.totalCost); // Get total cost
            const pendingOrderID = order.dataset.pendingOrderID; // Get pending order ID

            console.log("Checking out order:", menuItemIDs, "Total cost:", totalCost);

            await checkoutOrder(totalCost, menuItemIDs, pendingOrderID); // Finalize order checkout

            // Remove the order from the completed list after 5 minutes
            setTimeout(() => {
                if (order.parentElement === completedContainer) {
                    order.remove();
                }
            }, 300000); // 5 minutes in milliseconds
        }
    });

    // Periodic real-time updates for pending orders
    setInterval(async () => {
        await loadPendingOrders(); // Refresh pending orders every 30 seconds
    }, 30000); // 30 seconds in milliseconds
});

/**
 * Fetches pending orders from the API and displays them in the "in-progress" container.
 * Orders are processed based on their type (e.g., Bowl, Plate, Bigger Plate) and their components.
 * If no menu item details are found for an ID, a warning is logged.
 */
async function loadPendingOrders() {
    const inProgressContainer = document.querySelector("#inProgress .orderContainer");

    try {
        // Fetch pending orders from the API
        const response = await fetch('/api/getpendingorders');
        if (!response.ok) {
            throw new Error(`Failed to fetch Pending Orders: ${response.statusText}`);
        }

        const pendingOrders = await response.json();
        console.log('Fetched Pending Orders (Kitchen):', pendingOrders);

        // Clear existing orders in the container
        inProgressContainer.innerHTML = '';

        // Loop through each pending order
        for (const order of pendingOrders) {
            const orderCard = document.createElement("div");
            orderCard.classList.add("orderCard");
            orderCard.dataset.status = "in-progress";
            orderCard.dataset.menuItemIDs = JSON.stringify(convertToArray(order.menuitemids)); // Store menu item IDs
            orderCard.dataset.totalCost = order.totalcost; // Store total cost
            orderCard.dataset.name = order.name; // Store customer's name
            orderCard.dataset.pendingOrderID = order.pendingorderid; // Store pending order ID

            // Set start time for the order
            const orderTimestamp = order.date ? new Date(order.date) : new Date();
            orderCard.dataset.startTime = orderTimestamp.getTime();

            // Create order title
            const orderTitle = document.createElement("h3");
            orderTitle.textContent = `Order for ${order.name}`;

            // Create the order list container
            const orderList = document.createElement("div");
            orderList.classList.add("order-list");

            // Extract and process menu item IDs
            const items = convertToArray(order.menuitemids);

            let i = 0; // Index to track position in the items array
            while (i < items.length) {
                const itemId = items[i];
                const itemDetails = menuItemDetails[itemId];

                if (!itemDetails) {
                    console.warn(`No details found for menuItemId: ${itemId}`);
                    i++;
                    continue;
                }

                // Process different types of items (Bowl, Plate, Bigger Plate)
                if (itemDetails.name.toLowerCase().includes("bowl")) {
                    const bowlItem = document.createElement("div");
                    bowlItem.textContent = `Bowl`;
                    const bowlList = document.createElement("ul");

                    // Add up to 3 components for the bowl
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
                    i += 4; // Skip the bowl and its components
                } else if (itemDetails.name.toLowerCase().includes("plate") && !itemDetails.name.toLowerCase().includes("bigger")) {
                    const plateItem = document.createElement("div");
                    plateItem.textContent = `Plate`;
                    const plateList = document.createElement("ul");

                    // Add up to 4 components for the plate
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
                    i += 5; // Skip the plate and its components
                } else if (itemDetails.name.toLowerCase().includes("bigger plate")) {
                    const biggerPlateItem = document.createElement("div");
                    biggerPlateItem.textContent = `Bigger Plate`;
                    const biggerPlateList = document.createElement("ul");

                    // Add up to 5 components for the bigger plate
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
                    i += 6; // Skip the bigger plate and its components
                } else {
                    // Process individual items (e.g., drinks, appetizers)
                    const singleItem = document.createElement("div");
                    singleItem.textContent = formatWithSize(itemDetails.name, itemDetails.size);
                    orderList.appendChild(singleItem);
                    i++;
                }
            }

            // Append the order title and list to the card
            orderCard.appendChild(orderTitle);
            orderCard.appendChild(orderList);

            // Add a timer element
            const timer = document.createElement("p");
            timer.classList.add("timer");
            timer.textContent = "Time: 0:00"; // Initial timer value
            orderCard.appendChild(timer);

            // Add the completed card to the in-progress container
            inProgressContainer.appendChild(orderCard);

            // Start a timer for the order
            startTimer(orderCard, timer);
        }
    } catch (error) {
        console.error('Error loading pending orders:', error);
    }
}

/**
 * Converts a string of menu item IDs into an array of integers.
 * If the input is already an array, it is returned as is.
 * 
 * @param {string|Array} menuitemids - The menu item IDs in string or array format.
 * @returns {Array<number>} An array of parsed menu item IDs.
 */
function convertToArray(menuitemids) {
    if (typeof menuitemids === "string") {
        // Remove special characters and split into an array of IDs
        return menuitemids.replace(/[{}[\]]/g, '').split(',').map(id => parseInt(id.trim(), 10));
    }
    return menuitemids; // Return as is if already an array
}

/**
 * Starts a timer for an order card and updates the timer display every second.
 * The card's background color changes based on elapsed time thresholds:
 * - Green: Less than 3 minutes.
 * - Yellow: 3 to 5 minutes.
 * - Red: More than 5 minutes.
 * 
 * @param {HTMLElement} orderCard - The DOM element representing the order card.
 * @param {HTMLElement} timerElement - The DOM element where the timer is displayed.
 */
function startTimer(orderCard, timerElement) {
    const startTime = parseInt(orderCard.dataset.startTime, 10); // Retrieve start time from dataset

    /**
     * Updates the timer display and order card styling based on elapsed time.
     */
    const updateTimer = () => {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000); // Elapsed time in seconds

        // Calculate minutes and seconds for display
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;

        // Update the timer display, if the element exists
        if (timerElement) {
            timerElement.textContent = `Time: ${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        }

        // Update the order card background color based on elapsed time
        if (orderCard.dataset.status === "in-progress") {
            if (elapsedTime >= 300) {
                orderCard.style.backgroundColor = "#FF6347"; // Red for orders older than 5 minutes
            } else if (elapsedTime >= 180) {
                orderCard.style.backgroundColor = "#FFD700"; // Yellow for orders between 3 and 5 minutes
            } else {
                orderCard.style.backgroundColor = "#32CD32"; // Green for new orders
            }
        }
    };

    // Schedule the timer to update every second
    setInterval(updateTimer, 1000);
}

/**
 * Completes the checkout process for an order.
 * - Updates the order status in the system.
 * - Updates inventory based on the items in the order.
 * - Deletes the pending order after a successful checkout.
 * 
 * @param {number} totalCost - The total cost of the order.
 * @param {Array<number>} menuItemIDs - The IDs of the menu items in the order.
 * @param {number} pendingOrderID - The ID of the pending order to be removed.
 */
async function checkoutOrder(totalCost, menuItemIDs, pendingOrderID) {
    try {
        // Send order update request
        const response = await fetch('/api/updateorders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ totalCost, menuItemIDs }),
        });

        if (!response.ok) {
            throw new Error('Failed to update order.');
        }

        console.log('Order successfully checked out:', await response.json());

        // Update inventory after successful checkout
        await updateInventory(menuItemIDs);

        // Delete the pending order
        await deletePendingOrder(pendingOrderID);

    } catch (error) {
        console.error('Error during checkout:', error);
    }
}

/**
 * Deletes a pending order from the system.
 * 
 * @param {number} pendingOrderID - The ID of the pending order to delete.
 */
async function deletePendingOrder(pendingOrderID) {
    try {
        // Send DELETE request for the pending order
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

/**
 * Updates inventory levels based on the menu items in the order.
 * 
 * @param {Array<number>} menuItemIDs - The IDs of the menu items to update inventory for.
 */
async function updateInventory(menuItemIDs) {
    try {
        // Send inventory update request
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