let token = localStorage.getItem('token');
let activeUsers = [];

axios.get('http://localhost:3000/user/activeUsers')
    .then(response => {
        console.log('API response: ', response.data.activeUsers[0])
        const activeUsers = response.data.activeUsers;
        updateActiveUsersUI(activeUsers, '');
        
    })
    .catch(err => {
        console.error("Error fetching active users: ", err);
});


const decodedToken = parseJwt(token);
console.log('decode ye aaya: ', decodedToken)
const currentUser = decodedToken.name;

async function sendMessage(name = currentUser){
    try{
        const messageInput = document.getElementById('messageInput');
        
        const trimmedMessage = messageInput.value.trim();
    
        const chat = {
            name: name,
            trimmedMessage: trimmedMessage
        };

        console.log(chat);
        const res = await axios.post('http://localhost:3000/chat/message', chat, { headers: { "Authorization": token} });
        
        if(res.data && res.data.message && res.data.name) {
            const sentMessage = res.data.message;
            const sentbyName = res.data.name;
            console.log('Sent message: ', sentMessage);
            console.log('message send by: ', sentbyName);
            sendMessages(sentbyName, sentMessage);
        } else{
            console.log('message data not found in api response');
        }
    } catch(err){
        console.log('error sending message: ', err);
    }
    
}

function sendMessages(name, message) {
        
        
        console.log('current: ', currentUser);

        console.log('called parameter: ', name)
        if(message !== ''){
            console.log('sent message --> ', message);
            const messagesContainer = document.getElementById('messagesContainer');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            
            
            if(name === currentUser){
                messageElement.textContent = `You: ${message}`;
            } else{
                messageElement.textContent = `${name}: ${message}`;
            }
            messagesContainer.appendChild(messageElement);

            messageInput.value = '';

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else{
            console.log('koi message nhi h');
        }

        updateActiveUsersUI(activeUsers, message);
}

function updateActiveUsersUI(activeUsers, message){
    if(Array.isArray(activeUsers)){
        
        const messagesContainer = document.getElementById('messagesContainer');
        activeUsers.forEach(user => {        
            console.log('active h ye to: ', user)
            console.log('Received msg: ', message)
            
            const userActive = document.createElement('div');
            userActive.classList.add('active-user-item');
            userActive.id = user.id;
            if(user.name === currentUser){
                userActive.textContent = `You joined`;
            } else{
                userActive.textContent = `${user.name} joined`;
            }
            
            messagesContainer.appendChild(userActive);
        
        })
    } else{
        console.error('Active users data is not an array:', activeUsers);
    }
        
    
}

async function fetchActiveUsers() {
    try{
        const response = await axios.get('http://localhost:3000/user/getActiveUsers')
        activeUsers = response.data.activeUsers;
        console.log('from fetching: ', activeUsers);
        updateActiveUsersUI(activeUsers, '');
        
    } catch(err){
        console.error("Error fetching active users: ", err);
    }
}

async function fetchMessaages() {
    try{
        const response = await axios.get('http://localhost:3000/chat/getMessages');
        const messages = response.data;

        messages.forEach(chat => {
            sendMessages(chat.name, chat.message);
        });
    } catch(err){
        console.error("Error fetching messages: ", err);
    }
}

window.onload = async function (){
    await fetchActiveUsers();
    await fetchMessaages();
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
    
    //console.log('token: ', token);
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

async function logout() {
    try{
        console.log('logout button clicked');
    

        const emailId = getEmailIdFromToken();
        console.log('Email Id: ', emailId);

        const response = await axios.post('http://localhost:3000/user/logout', {
            emailId: emailId
        })
        activeUsers = response.data.activeUsers;
        console.log('after logout active user: ', activeUsers);
        console.log('User logged out successfully');
        window.location.href = 'http://localhost:3000/user/login';
       
    } catch(err){   
            console.log('Error logging out: ', err);
            window.location.href = 'http://localhost:3000/user/login';
        
    }
    
    

    

    
}