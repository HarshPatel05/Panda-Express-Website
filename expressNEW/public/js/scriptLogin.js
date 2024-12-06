/**
 * Creates a Google Translate Element for page translation
 */
function googleTranslateElementInit(){
    new google.translate.TranslateElement(
        {pageLanguage: "en"},
        "googleTranslateElement"
    )
}

/**
 * Generates the Google OAuth URL for employee authentication and sets it to the login link.
 * @function googleOAuthURL
 * 
 * @throws {Error} If the fetch request to the '/api/configEmployee' endpoint fails or the 
 *                 response does not contain valid configuration data.
 * 
 * @returns {void}
 */
async function googleOAuthURL() {
    const URL = 'https://accounts.google.com/o/oauth2/v2/auth';

    try {
        const response = await fetch('/api/configEmployee');
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

/**
 * Event listener for the login submission.
 * sends the login credentials to the server,
 * and handles the server's response to navigate the user to the appropriate page based on their role.
 * 
 * @param {Event} e - The submission event.
 * @returns {void}
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


/**
 * Logs in an employee based on the 'name' URL parameter, sends the login request to the backend,
 * and redirects the user to different pages based on their position.
 * @function scriptLoginOAuth
 * 
 * @throws {Error} If the fetch request to '/api/employee/login' fails or the response 
 *                 is not valid JSON.
 * 
 * @returns {void}
 */
async function scriptLoginOAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name'); 
    if (!name) {
      console.log('No name parameter found in URL');
      return;
    }
  
    const decodedName = decodeURIComponent(name);
  
    try {
        const response = await fetch('/api/employee/login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            name: decodedName,
            }),
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

    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', scriptLoginOAuth);
  