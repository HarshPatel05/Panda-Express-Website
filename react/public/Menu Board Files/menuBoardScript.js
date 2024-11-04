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