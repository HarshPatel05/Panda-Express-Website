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
        console.log('Fetching seasonal items...');
        
        // Fetch seasonal items from the API endpoint
        const response = await fetch('/api/seasonalItems');
        if (!response.ok) {
            throw new Error(`Failed to fetch seasonal items: ${response.statusText}`);
        }
        
        const menuItems = await response.json();
        console.log('Fetched Seasonal Items:', menuItems);

        // Section containers for Entrees, Sides, and Appetizers
        const entreeSection = document.querySelector('#entreeSection .specials-grid');
        const sideSection = document.querySelector('#sideSection .specials-grid');
        const appetizerSection = document.querySelector('#appetizerSection .specials-grid');

        // Check for missing sections
        if (!entreeSection || !sideSection || !appetizerSection) {
            throw new Error('One or more sections are missing from the DOM.');
        }

        // Clear previous content
        entreeSection.innerHTML = '';
        sideSection.innerHTML = '';
        appetizerSection.innerHTML = '';

        // Filter and ensure unique seasonal items
        const uniqueItems = new Set();
        const activeItems = menuItems.filter(item => {
            const uniqueKey = `${item.menuitem}-${item.status}`;
            if (item.status === "active" && !uniqueItems.has(uniqueKey)) {
                uniqueItems.add(uniqueKey);
                return true;
            }
            return false;
        });

        console.log('Active Items:', activeItems);

        // Render items to their respective sections
        activeItems.forEach(item => {
            const specialItem = document.createElement('div');
            specialItem.classList.add('special-item');

            // Add item display name
            specialItem.innerHTML = `
                <div class="special-name">${item.displayname}</div>
                <div class="special-size">Size: ${item.size}</div>
                <div class="special-price">Price: $${item.price.toFixed(2)}</div>
            `;

            // Append to the correct section based on item type
            if (item.type === "entree") {
                entreeSection.appendChild(specialItem);
            } else if (item.type === "side") {
                sideSection.appendChild(specialItem);
            } else if (item.type === "appetizer") {
                appetizerSection.appendChild(specialItem);
            } else {
                console.warn(`Unknown item type: ${item.type}`);
            }
        });

        // Fallback messages for empty sections
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
        console.error('Error loading seasonal items:', error);
    }
}