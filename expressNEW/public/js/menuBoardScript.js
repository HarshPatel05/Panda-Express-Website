document.addEventListener("DOMContentLoaded", () => {
  const animatedImages = document.querySelectorAll('.animated-img');

  animatedImages.forEach(imgElement => {
      const images = JSON.parse(imgElement.getAttribute('data-images') || '[]');
      let currentIndex = 0;

      if (images.length > 0) {
          setInterval(() => {
              currentIndex = (currentIndex + 1) % images.length;
              imgElement.style.opacity = 0;

              setTimeout(() => {
                  imgElement.src = images[currentIndex];
                  imgElement.style.opacity = 1;
              }, 500); // Matches CSS transition duration
          }, 7000); // Adjust interval time as needed
      }
  });

  loadMenuItems();
});

async function loadMenuItems() {
  try {
      const response = await fetch('/api/menuitems');
      if (!response.ok) {
          throw new Error(`Failed to fetch menu items: ${response.statusText}`);
      }

      const menuItems = await response.json();
      console.log('Fetched Menu Items:', menuItems);

      const bowlItem = menuItems.find(item => item.menuitem === "bowl");
      if (bowlItem) {
          document.getElementById('bowlPrice').textContent = `$${bowlItem.price.toFixed(2)}`;
      } else {
          console.warn('Bowl item not found in the menu items');
      }
  } catch (error) {
      console.error('Error loading menu items:', error);
  }
}
