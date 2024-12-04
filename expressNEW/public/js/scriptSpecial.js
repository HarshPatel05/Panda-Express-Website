/**
 * Event listener for when the DOM is fully loaded. 
 * Calls the loadMenuItems function to fetch and display the menu items.
 */
document.addEventListener("DOMContentLoaded", () => {
    loadMenuItems();
});

/**
 * Fetches the menu items from the API, processes the data, and displays them 
 * in their respective sections (Entrees, Sides, Appetizers).
 * 
 * @async
 * @function loadMenuItems
 * @throws {Error} Throws an error if fetching the menu items fails.
 */
async function loadMenuItems() {
    try {
        // Fetch the menu items from the API endpoint
        const response = await fetch('/api/menuitems');

        // If the response is not ok, throw an error
        if (!response.ok) {
            throw new Error(`Failed to fetch menu items: ${response.statusText}`);
        }

        // Parse the fetched data as JSON
        const menuItems = await response.json();
        console.log('Fetched Menu Items:', menuItems);

        // Section containers for Entrees, Sides, and Appetizers
        const entreeSection = document.querySelector('#entreeSection .specials-grid');
        const sideSection = document.querySelector('#sideSection .specials-grid');
        const appetizerSection = document.querySelector('#appetizerSection .specials-grid');

        // Clear any existing content in the sections
        entreeSection.innerHTML = '';
        sideSection.innerHTML = '';
        appetizerSection.innerHTML = '';

        /**
         * Filter the menu items to include only active ones, 
         * and ensure there are no duplicate menu items.
         */
        const uniqueItems = [];
        const activeItems = menuItems.filter(item => {
            // Check if the item is active and if it hasn't already been added
            if (item.status === "active" && !uniqueItems.includes(item.menuitem)) {
                uniqueItems.push(item.menuitem);
                return true; // Include this item
            }
            return false; // Exclude duplicate or inactive items
        });

        // Loop through the active items and create the HTML elements to display them
        activeItems.forEach(item => {
            // Create a new div for each special item
            const specialItem = document.createElement('div');
            specialItem.classList.add('special-item');

            // Add the display name of the item to the special item
            specialItem.innerHTML = `
                <div class="special-name">${item.displayname}</div>
            `;

            // Append the special item to the appropriate section based on its type
            if (item.type === "entree") {
                entreeSection.appendChild(specialItem);
            } else if (item.type === "side") {
                sideSection.appendChild(specialItem);
            } else if (item.type === "appetizer") {
                appetizerSection.appendChild(specialItem);
            }
        });

        // Display fallback message if any section is empty (no active items)
        if (entreeSection.children.length === 0) {
            entreeSection.innerHTML = '<p>No active entrees available at the moment.</p>';
        }
        if (sideSection.children.length === 0) {
            sideSection.innerHTML = '<p>No active sides available at the moment.</p>';
        }
        if (appetizerSection.children.length === 0) {
            appetizerSection.innerHTML = '<p>No active appetizers available at the moment.</p>';
        }

    } catch (error) {
        // Log any errors that occur during the fetch or processing of menu items
        console.error('Error loading menu items:', error);
    }
}
