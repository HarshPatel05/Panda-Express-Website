//Translation Functionality
function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: "en" },
        "googleTranslateElement"
    )
}


function setupTabs() {
    const tabs = document.querySelectorAll('.tabLinks');
    const contents = document.querySelectorAll('.tabContent');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
           
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(content => content.style.display = 'none');

            
            tab.classList.add('active');
            contents[index].style.display = 'block';
        });
    });


    tabs[0].classList.add('active');
    contents[0].style.display = 'block';
}

window.onload = setupTabs;
