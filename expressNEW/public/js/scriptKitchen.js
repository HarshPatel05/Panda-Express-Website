document.addEventListener("DOMContentLoaded", () => {
    const inProgressContainer = document.querySelector("#inProgress .orderContainer");
    const completedContainer = document.querySelector("#completed .orderContainer");

    let voices = [];

    // Load available voices
    const loadVoices = () => {
        voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);
    };

    // Ensure voices are loaded before using them
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    } else {
        loadVoices();
    }

    // Function to fetch and play audio
    const playAudioFromAPI = async (text) => {
        try {
            const response = await fetch(`/api/generate-audio?text=${encodeURIComponent(text)}`);
            if (!response.ok) throw new Error('Failed to fetch audio');
            
            const blob = await response.blob();
            const audioURL = URL.createObjectURL(blob);
            
            // Play the audio
            const audio = new Audio(audioURL);
            audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    };

    // Handle click events for orders in "In Progress"
    inProgressContainer.addEventListener("click", (e) => {
        const order = e.target.closest(".orderCard");
        if (order && order.dataset.status === "in-progress") {
            // Move to completed section
            order.dataset.status = "completed";
            completedContainer.appendChild(order);
            order.style.cursor = "default";

            // Set up and play the speech
            const speechSynthesis = window.speechSynthesis;
            const text = "The bluetooth device, is connected succesfully";
            const speech = new SpeechSynthesisUtterance(text);

            // Select a voice (e.g., Google US English or first available)
            const selectedVoice = voices.find(voice => voice.name.includes("Google 國語（臺灣）")) || voices[0];
            if (selectedVoice) {
                speech.voice = selectedVoice;
            }

            speechSynthesis.speak(speech);



            // Test TTS by sending "Hello, world!" to the PlayHT API
            // playAudioFromAPI('My fellow Americans');

            // Set a timer to auto-remove after 5 minutes
            setTimeout(() => {
                if (order.parentElement === completedContainer) {
                    order.remove();
                }
            }, 300000); // 5 minutes
        }
    });

    // Handle click events for orders in "Completed"
    completedContainer.addEventListener("click", (e) => {
        const order = e.target.closest(".orderCard");
        if (order && order.dataset.status === "completed") {
            // Remove order immediately when clicked
            order.remove();
        }
    });
});


async function loadPendingOrders()
{
    try
    {
        const response = await fetch('/api/getpendingorders');
        if (!response.ok)
        {
            throw new Error(`Failed to fetch Pending Orders: ${response.statusText}`);
        }

        const pendingOrders = await response.json();
        console.log('Fetched Pending Orders (Kitchen):', pendingOrders);

        // Clear the existing orders in progress before rendering
        inProgressContainer.innerHTML = '';

        // Render each pending order
        for (const order of pendingOrders)
        {
            const orderCard = document.createElement("div");
            orderCard.classList.add("orderCard");
            orderCard.dataset.status = "in-progress";

            const orderTitle = document.createElement("h3");
            orderTitle.textContent = `Order #${order.pendingorderid}`;  // Use pendingorderid from the database

            const orderList = document.createElement("ul");

            // Convert the menuitemids string to an array and fetch item names
            const items = order.menuitemids.slice(1, -1).split(',');  // Strip the curly braces and split by comma

            for (const itemId of items)
            {
                const itemIdTrimmed = itemId.trim();  // Trim spaces
                const itemName = await getItemNameById(itemIdTrimmed);  // Fetch the display name of the item
                
                const listItem = document.createElement("li");
                listItem.textContent  = itemName || `Item ID: ${itemIdTrimmed}`; // if itemName is not null then that or else the Item ID
                orderList.appendChild(listItem);
            }

            orderCard.appendChild(orderTitle);
            orderCard.appendChild(orderList);
            inProgressContainer.appendChild(orderCard);
        }
    }
    catch (err)
    {
        console.error('Error loading pending orders:', err);
    }
}


// Function to get the display name of a menu item by its ID
async function getItemNameById(itemId)
{
    try
    {
        const response = await fetch(`/api/getdisplayname?menuitemID=${itemId}`); // Call the backend API with the menu item ID

        if (!response.ok) {
            throw new Error(`Failed to fetch display name for ID ${itemId}: ${response.statusText}`);
        }

        const itemName = await response.text(); // Assuming the API returns only the display name as plain text
        return itemName; // Return the fetched display name
    }
    catch(err)
    {
        console.error(`Error fetching menu item name for ID ${itemId}:`, err);
        return null;  // Return null if there was an error fetching the name
    }
}

// Function to update order
async function updateOrder(totalCost, menuItemIDs)
{
    try
    {
        const response = await fetch('/api/updateorders',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify
            ({
                totalCost: totalCost,
                menuItemIDs: menuItemIDs
            })
        });
        const data = await response.json();
        console.log('Order updated:', data);
    }
    catch (error)
    {
        console.error('Error updating order:', error);
    }
}

// Function to update inventory
async function updateInventory(menuItemIDs)
{
    try
    {
        const response = await fetch('/api/updateinventory',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menuItemIDs: menuItemIDs })
        });

        const data = await response.json();
        console.log('Inventory updated:', data);
    }
    catch (error)
    {
        console.error('Error updating inventory:', error);
    }
}
