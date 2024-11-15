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
    console.log('Fetched Menu Items (menuBoard):', menuItems);

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    //                            SECTION 1: MENU BOARD DATA                                           //
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    // Bowl, plate and bigger plate information
    const bowlItem = menuItems.find(item => item.menuitem === "bowl");
    document.getElementById('bowlPrice').textContent = `$${bowlItem.price.toFixed(2)}`;
    document.getElementById('bowlName').textContent = bowlItem.displayname;

    const plateItem = menuItems.find(item => item.menuitem === "plate");
    document.getElementById('platePrice').textContent = `$${plateItem.price.toFixed(2)}`;
    document.getElementById('plateName').textContent = plateItem.displayname;

    const biggerPlateItem = menuItems.find(item => item.menuitem === "biggerPlate");
    document.getElementById('biggerPlatePrice').textContent = `$${biggerPlateItem.price.toFixed(2)}`;
    document.getElementById('biggerPlateName').textContent = biggerPlateItem.displayname;

    // A La Carte entree prices (Based off of orange chicken)
    const aLaCarteSmEntreeItem = menuItems.find(item => item.menuitem === "orangeChicken" && item.size === "sm");
    document.getElementById('aLaCarteSmEntreeName').textContent = `$${aLaCarteSmEntreeItem.price.toFixed(2)}`;

    const aLaCarteMedEntreeItem = menuItems.find(item => item.menuitem === "orangeChicken" && item.size === "md");
    document.getElementById('aLaCarteMedEntreeName').textContent = `$${aLaCarteMedEntreeItem.price.toFixed(2)}`;

    const aLaCarteLgEntreeItem = menuItems.find(item => item.menuitem === "orangeChicken" && item.size === "lg");
    document.getElementById('aLaCarteLgEntreeName').textContent = `$${aLaCarteLgEntreeItem.price.toFixed(2)}`;

    // A La Carte side prices (Based off Super Greens)
    const aLaCarteMedSideItem = menuItems.find(item => item.menuitem === "superGreens" && item.size === "md");
    document.getElementById('aLaCarteMedSideName').textContent = `$${aLaCarteMedSideItem.price.toFixed(2)}`;

    const aLaCarteLgSideItem = menuItems.find(item => item.menuitem === "superGreens" && item.size === "lg");
    document.getElementById('aLaCarteLgSideName').textContent = `$${aLaCarteLgSideItem.price.toFixed(2)}`;


    /////////////////////////////////////////////////////////////////////////////////////////////////////
    //                            SECTION 2: MENU BOARD DATA                                           //
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    // All the names of the associated menu items
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


    /////////////////////////////////////////////////////////////////////////////////////////////////////
    //                            SECTION 3: MENU BOARD DATA                                           //
    /////////////////////////////////////////////////////////////////////////////////////////////////////

    // Sides names
    const superGreensItem = menuItems.find(item => item.menuitem === "superGreens");
    document.getElementById('superGreensName').textContent = superGreensItem.displayname;

    const whiteRiceItem = menuItems.find(item => item.menuitem === "whiteRice");
    document.getElementById('whiteRiceName').textContent = whiteRiceItem.displayname;

    const friedRiceItem = menuItems.find(item => item.menuitem === "friedRice");
    document.getElementById('friedRiceName').textContent = friedRiceItem.displayname;

    const chowMeinItem = menuItems.find(item => item.menuitem === "chowMein");
    document.getElementById('chowMeinName').textContent = chowMeinItem.displayname;

    // Sides
    const chickenEggRollItem = menuItems.find(item => item.menuitem === "chickenEggRoll");
    document.getElementById('chickenEggRollName').textContent = chickenEggRollItem.displayname;
    document.getElementById('chickenEggRollPrice').textContent = `$${chickenEggRollItem.price.toFixed(2)}`;

    const veggieSpringRollItem = menuItems.find(item => item.menuitem === "veggieSpringRolls");
    document.getElementById('veggieSpringRollName').textContent = veggieSpringRollItem.displayname;
    document.getElementById('veggieSpringRollPrice').textContent = `$${veggieSpringRollItem.price.toFixed(2)}`;

    const creamCheeseRangoonItem = menuItems.find(item => item.menuitem === "creamCheeseRangoons");
    document.getElementById('creamCheeseRangoonName').textContent = creamCheeseRangoonItem.displayname;
    document.getElementById('creamCheeseRangoonPrice').textContent = `$${creamCheeseRangoonItem.price.toFixed(2)}`;

    const applePieRollItem = menuItems.find(item => item.menuitem === "applePieRoll");
    document.getElementById('applePieRollName').textContent = applePieRollItem.displayname;
    document.getElementById('applePieRollPrice').textContent = `$${applePieRollItem.price.toFixed(2)}`;

    // Drinks
    const smallDrinkItem = menuItems.find(item => item.menuitem === "fountainDrink" && item.size === "sm");
    document.getElementById('smallDrinkName').textContent = smallDrinkItem.displayname;
    document.getElementById('smallDrinkPrice').textContent = `$${smallDrinkItem.price.toFixed(2)}`;

    const mediumDrinkItem = menuItems.find(item => item.menuitem === "fountainDrink" && item.size === "md");
    document.getElementById('mediumDrinkName').textContent = mediumDrinkItem.displayname;
    document.getElementById('mediumDrinkPrice').textContent = `$${mediumDrinkItem.price.toFixed(2)}`;

    const largeDrinkItem = menuItems.find(item => item.menuitem === "fountainDrink" && item.size === "lg");
    document.getElementById('largeDrinkName').textContent = largeDrinkItem.displayname;
    document.getElementById('largeDrinkPrice').textContent = `$${largeDrinkItem.price.toFixed(2)}`;

    const bottleWaterItem = menuItems.find(item => item.menuitem === "water");
    document.getElementById('bottleWaterName').textContent = bottleWaterItem.displayname;
    document.getElementById('bottleWaterPrice').textContent = `$${bottleWaterItem.price.toFixed(2)}`;

    const gatoradeItem = menuItems.find(item => item.menuitem === "gatorade");
    document.getElementById('gatoradeName').textContent = gatoradeItem.displayname;
    document.getElementById('gatoradePrice').textContent = `$${gatoradeItem.price.toFixed(2)}`;


  } catch (error) {
      console.error('Error loading menu items:', error);
  }
}
