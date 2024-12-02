//Functionality for Translation
function googleTranslateElementInit(){
    new google.translate.TranslateElement(
        {pageLanguage: "en"},
        "googleTranslateElement"
    )
}

/*
async function googleOAuthURL() {
    const URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    try {
        const response = await fetch('/api/config');
        const config = await response.json();

        const scopes = [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
        const options = {
            redirect_uri: config.redirectUrl,
            client_id: config.googleClientId,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: scopes.join(' ')
        }
    
        const qs = new URLSearchParams(options)
    
        const oauthURL = `${URL}?${qs.toString()}`;
    
        const authLink = document.getElementById('OAuthLogin');
        if (authLink) {
            authLink.href = oauthURL;
        }
    }catch (err) {

    }
}
document.addEventListener('DOMContentLoaded', googleOAuthURL);
*/


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

        if (result.status) { 
            if (result.position === 'Server') {
                window.location.href = '/register';
            } else if (result.position === 'Manager') {
                window.location.href = '/manager';
            }
        } else {
            alert(result.error || 'Login failed');
        }

    } catch (err) {
        console.error('Error during login:', err);
        alert('An error occurred. Please try again later.');
    }
});