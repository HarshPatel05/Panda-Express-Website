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

    // SECTION 1 MENU BOARD DATA
    const menuItems = await response.json();
    console.log('Fetched Menu Items (menuBoard):', menuItems);

    const bowlItem = menuItems.find(item => item.menuitem === "bowl");
    document.getElementById('bowlPrice').textContent = `$${bowlItem.price.toFixed(2)}`;

    const plateItem = menuItems.find(item => item.menuitem === "plate");
    document.getElementById('platePrice').textContent = `$${plateItem.price.toFixed(2)}`;

    const biggerPlateItem = menuItems.find(item => item.menuitem === "biggerPlate");
    document.getElementById('biggerPlatePrice').textContent = `$${biggerPlateItem.price.toFixed(2)}`;


    // SECTION 2 MENU BOARD DATA
    const orangeChickenItem = menuItems.find(item => item.menuitem === "orangeChicken");
    document.getElementById('orangeChickenName').innerHTML = orangeChickenItem.displayname;

    const blackPepperChickenItem = menuItems.find(item => item.menuitem === "blackPepperChicken");
    document.getElementById('blackPepperChickenName').innerHTML = blackPepperChickenItem.displayname;

    const broccoliBeefItem = menuItems.find(item => item.menuitem === "broccoliBeef");
    document.getElementById('broccoliBeefName').innerHTML = broccoliBeefItem.displayname;

    const blackPepperSteakItem = menuItems.find(item => item.menuitem === "blackPepperSteak");
    document.getElementById('blackPepperSteakName').innerHTML = blackPepperSteakItem.displayname;

    const beijingBeefItem = menuItems.find(item => item.menuitem === "beijingBeef");
    document.getElementById('beijingBeefName').innerHTML = beijingBeefItem.displayname;

    const honeySesameItem = menuItems.find(item => item.menuitem === "honeySesameChicken");
    document.getElementById('honeySesameName').innerHTML = honeySesameItem.displayname;

    const kungPaoChickenItem = menuItems.find(item => item.menuitem === "kungPaoChicken");
    document.getElementById('kungPaoChickenName').innerHTML = kungPaoChickenItem.displayname;

    const honeyWalnutItem = menuItems.find(item => item.menuitem === "honeyWalnutShrimp");
    document.getElementById('honeyWalnutName').innerHTML = honeyWalnutItem.displayname;

    const teriyakiChickenItem = menuItems.find(item => item.menuitem === "grilledTeriyakiChicken");
    document.getElementById('teriyakiChickenName').innerHTML = teriyakiChickenItem.displayname;

    const bourbonChickenItem = menuItems.find(item => item.menuitem === "bourbonChicken");
    document.getElementById('bourbonChickenName').innerHTML = bourbonChickenItem.displayname;

    const mushroomChickenItem = menuItems.find(item => item.menuitem === "mushroomChicken");
    document.getElementById('mushroomChickenName').innerHTML = mushroomChickenItem.displayname;

    const stringBeanChickenItem = menuItems.find(item => item.menuitem === "stringBeanChicken");
    document.getElementById('stringBeanChickenName').innerHTML = stringBeanChickenItem.displayname;

    const sweetFireChickenItem = menuItems.find(item => item.menuitem === "sweetFireChicken");
    document.getElementById('sweetFireChickenName').innerHTML = sweetFireChickenItem.displayname;

  } catch (error) {
      console.error('Error loading menu items:', error);
  }
}
