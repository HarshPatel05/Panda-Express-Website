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
});

fetch('menuitems.json')
  .then(response => response.json()) // Parse the JSON response
  .then(data => {
    // Loop through each item in the data array and update the corresponding element by ID
    data.forEach(item => {
      // Find the price element by matching the menuitem name
      const priceElement = document.getElementById(item.menuitem.toLowerCase() + 'Price');
      if (priceElement) {
        // Update the innerText with the formatted price
        priceElement.innerText = `$${item.price.toFixed(2)}`;
      }
    });
  })
  .catch(error => {
    console.error('Error loading JSON:', error);
  });