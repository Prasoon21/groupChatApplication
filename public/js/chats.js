

function sendMessage() {
        const messageInput = document.getElementById('messageInput');
        
        const message = messageInput.value.trim();
        console.log('sent message --> ', message)
        if(message !== ''){
            const messagesContainer = document.getElementById('messagesContainer');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.textContent = message;
            messagesContainer.appendChild(messageElement);

            messageInput.value = '';

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function getEmailIdFromToken() {
    const token = localStorage.getItem('token');
    console.log('token: ', token);
    if(token){
        try{
            var decodedToken = parseJwt(token);
            console.log('decoded: ', decodedToken);
            if(decodedToken && decodedToken.emailId){
                console.log('email', decodedToken.emailId);
                return decodedToken.emailId;
            } else{
                console.error('Token does not contain emailId');
                return null;
            }
            
        } catch(err) {
            console.error('Error decoding token: ', err);
            return null;
        }
        
    } else{
        console.error('No token found');
        return null;
    }
    
}

function logout() {
    console.log('logout button clicked');
    

    const emailId = getEmailIdFromToken();
    console.log('Email Id: ', emailId);
    

    axios.post('http://localhost:3000/user/logout', {
        emailId: emailId
    })
    .then(response => {
        console.log('User logged out successfully');
        window.location.href = 'http://localhost:3000/user/login';
    })
    .catch(err => {
        console.log('Error logging out: ', err);
        window.location.href = 'http://localhost:3000/user/login';
    })

    
}