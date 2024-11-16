//Functionality for Translation
function googleTranslateElementInit(){
    new google.translate.TranslateElement(
        {pageLanguage: "en"},
        "googleTranslateElement"
    )
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {

    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            window.location.href = '/register'; 
        } else {
            alert(result.error || 'Login failed');
        }
    } catch (err) {
        console.error('Error during login:', err);
        alert('An error occurred. Please try again later.');
    }
});