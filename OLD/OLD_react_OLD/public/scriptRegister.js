let orderItems = [];
let currentCompositeItem = null;
let totalAmount = 0;
let currentSize = null;

// Function to initialize a new composite item (e.g., bowl, plate)
function selectItemType(type, price, entreesRequired, sidesRequired) {
    currentCompositeItem = {
        type: type,
        name: capitalize(type), // Set name to display correctly
        price: price,
        entreesRequired: entreesRequired,
        sidesRequired: sidesRequired,
        entrees: [],
        sides: []
    };
    updateCurrentItemPreview();
    openPanel('hiddenPanelMain');
}

// Function to add component to the current composite item
function addComponentToCurrentOrder(category, itemName) {
    if (category === 'alacarte') {
        // Ensure size is selected for à la carte items
        if (!currentSize) {
            alert("Please select a size for this à la carte item.");
            return;
        }

        // Set the à la carte item name with selected size
        const alacarteItem = {
            type: 'alacarte',
            name: `${currentSize} ${itemName}`,
            price: getAlacartePrice(currentSize),
            components: []
        };
        orderItems.push(alacarteItem);
        currentSize = null; // Reset size after adding item
        updateOrderList();
        calculateTotal();
        closePanel();
        return;
    }

    // Existing code for composite items like bowls and plates
    if (!currentCompositeItem) return;

    if (category === 'entree' && currentCompositeItem.entrees.length < currentCompositeItem.entreesRequired) {
        currentCompositeItem.entrees.push(itemName);
    } else if (category === 'side' && currentCompositeItem.sides.length < currentCompositeItem.sidesRequired) {
        currentCompositeItem.sides.push(itemName);
    }

    updateCurrentItemPreview();

    const isComplete = currentCompositeItem.entrees.length === currentCompositeItem.entreesRequired &&
                       currentCompositeItem.sides.length === currentCompositeItem.sidesRequired;

    if (isComplete) {
        addItemToOrder(currentCompositeItem);
        currentCompositeItem = null;
        updateCurrentItemPreview(); // Clear preview
        closePanel();
    }
}

// Function to add a drink to the order
function addDrinkToOrder(drinkName, price, size = null) {
    const drinkItem = {
        type: 'drink',
        name: size ? `${size} ${drinkName}` : drinkName,
        price: price,
        components: []
    };
    orderItems.push(drinkItem);
    updateOrderList();
    calculateTotal();
    closePanel(); // Return to main view after selection
}

// Function to add an appetizer to the order
function addAppetizerToOrder(appetizerName, price) {
    const appetizerItem = {
        type: 'appetizer',
        name: appetizerName,
        price: price,
        components: []
    };
    orderItems.push(appetizerItem);
    updateOrderList();
    calculateTotal();
    closePanel();
}

// Function to add an a la carte to the order
function selectAlacarteItem(itemName) {
    openPanel('hiddenPanelMain');
    currentCompositeItem = {
        type: 'alacarte',
        name: itemName,
        price: 0, // We'll set the price based on size
        components: []
    };
}

// Function to set the current size for à la carte items
function setSize(size) {
    currentSize = size;

    // Remove green background from all size buttons
    const sizeButtons = document.querySelectorAll('.size-button');
    sizeButtons.forEach(button => {
        button.style.backgroundColor = ''; // Reset background color
    });

    // Set green background on the selected button
    const selectedButton = document.getElementById(`size-${size}`);
    selectedButton.style.backgroundColor = 'green';

    alert(`Selected size: ${currentSize}`);
}

// Helper function to get price for à la carte items based on size
function getAlacartePrice(size) {
    const prices = {
        Small: 5.00,
        Medium: 7.50,
        Large: 9.00
    };
    return prices[size] || 0;
}

// Update preview for the current composite item
function updateCurrentItemPreview() {
    const preview = document.getElementById("currentItemPreview");
    if (!currentCompositeItem) {
        preview.innerHTML = "";
        return;
    }

    let previewHTML = `<strong>${currentCompositeItem.name} +$${currentCompositeItem.price.toFixed(2)}</strong><br>`;
    previewHTML += "<div class='item-components'>";
    previewHTML += currentCompositeItem.entrees.map(entree => `<div>- ${entree}</div>`).join('');
    previewHTML += currentCompositeItem.sides.map(side => `<div>- ${side}</div>`).join('');
    previewHTML += "</div>";

    preview.innerHTML = previewHTML;
}

// Add a completed item to the order
function addItemToOrder(item) {
    orderItems.push(item);
    updateOrderList();
    calculateTotal();
}

// Update the order list display
function updateOrderList() {
    const orderList = document.getElementById("orderList");
    orderList.innerHTML = "";

    orderItems.forEach((item, index) => {
        const listItem = document.createElement("div");
        listItem.classList.add("order-item");
        listItem.innerHTML = `
            ${capitalize(item.name)} +$${item.price.toFixed(2)}
            <div class="item-components">
                ${item.entrees ? item.entrees.map(entree => `<div>- ${entree}</div>`).join('') : ''}
                ${item.sides ? item.sides.map(side => `<div>- ${side}</div>`).join('') : ''}
            </div>
            <button onclick="removeItemFromOrder(${index})">Remove</button>
        `;
        orderList.appendChild(listItem);
    });
}

// Calculate the total amount
function calculateTotal() {
    totalAmount = orderItems.reduce((sum, item) => sum + item.price, 0);
    document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);
}

// Cancel the current composite item
function cancelCurrentCompositeItem() {
    currentCompositeItem = null;
    updateCurrentItemPreview();
    closePanel();
}

// Remove an item from the order by index
function removeItemFromOrder(index) {
    orderItems.splice(index, 1);
    updateOrderList();
    calculateTotal();
}

// Clear the order
function clearOrder() {
    orderItems = [];
    totalAmount = 0;
    updateOrderList();
    calculateTotal();
    updateCurrentItemPreview();
}

// Checkout and reset order
function checkoutOrder() {
    alert(`Order total is $${totalAmount.toFixed(2)}. Proceeding to checkout...`);
    clearOrder();
}

// Panel open and close functions
function openPanel(panelId) {
    document.getElementById('main-buttons').style.display = 'none';
    document.getElementById(panelId).style.display = 'block';
}

function closePanel() {
    document.querySelectorAll('.hidden-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.getElementById('main-buttons').style.display = 'grid';
}

// Helper function to capitalize the first letter of a string
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

document.addEventListener("DOMContentLoaded", function() {
    const animatedImages = document.querySelectorAll('.animated-img');

    animatedImages.forEach(imgElement => {
        const images = JSON.parse(imgElement.getAttribute('data-images'));
        let currentIndex = 0;

        function changeImage() {
            currentIndex = (currentIndex + 1) % images.length; // Cycle through images
            imgElement.style.opacity = 0; // Start fade out
            
            setTimeout(() => {
                imgElement.src = images[currentIndex]; // Change the image
                imgElement.style.opacity = 1; // Fade back in
            }, 500); // Match this to the CSS transition duration
        }

        setInterval(changeImage, 7000); // Change image every 3 seconds
    });

    // Fetch menu items and dynamically create buttons
    fetch('menuitems.json')
      .then(response => response.json())
      .then(data => {
          const buttonContainer = document.getElementById('buttonContainer'); // Make sure you have an element with this ID in your HTML
          
          data.forEach(item => {
              // Create a button for each menu item
              const button = document.createElement('button');
              button.id = item.menuitem.toLowerCase() + 'Button';
              button.className = 'menu-item-button'; // You can style all buttons with this class

              // Set the button text
              button.innerText = `${item.menuitem} - $${item.price.toFixed(2)}`;
              
              // Set an event listener if needed (e.g., to add the item to an order)
              button.addEventListener('click', () => {
                  // Add item to order logic here
                  console.log(`Added ${item.menuitem} to order!`);
              });

              // Append the button to the container
              buttonContainer.appendChild(button);
          });
      })
      .catch(error => {
          console.error('Error loading JSON:', error);
      });
});
