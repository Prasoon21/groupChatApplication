let token = localStorage.getItem('token');
let activeUsers = [];
let joinedUsers = new Set();


function getStoredMessages() {
    const storedMessages = localStorage.getItem('messages');
    return storedMessages ? JSON.parse(storedMessages) : [];
}

function saveMessages(messages) {
    localStorage.setItem('messages', JSON.stringify(messages));
}

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
            displayMessage(sentbyName, sentMessage);
        } else{
            console.log('message data not found in api response');
        }
    } catch(err){
        console.log('error sending message: ', err);
    }
    
}

async function displayMessage(name, message) {
    try{
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
    } catch(err) {
        console.log('error sending message: ', err)
    }
        
}

function updateActiveUsersUI(activeUsers, message){
    if(Array.isArray(activeUsers)){
        
        const messagesContainer = document.getElementById('messagesContainer');
        activeUsers.forEach(user => {        
            console.log('active h ye to: ', user)
            console.log('Received msg: ', message)
            if(!joinedUsers.has(user.name)) {
                const userActive = document.createElement('div');
                userActive.classList.add('active-user-item');
                userActive.id = user.id;
                if(user.name === currentUser){
                    userActive.textContent = `You joined`;
                } else{
                    userActive.textContent = `${user.name} joined`;
                }
                
                messagesContainer.appendChild(userActive);
                joinedUsers.add(user.name);
            }
            
        
        })
    } else{
        console.error('Active users data is not an array:', activeUsers);
    }
        
    
}

async function fetchActiveUsers() {
    try {
        const response = await axios.get('http://localhost:3000/user/getActiveUsers');
        return response.data.activeUsers;
    } catch (err) {
        console.error("Error fetching active users: ", err);
        return [];
    }
}

async function fetchMessagesFromDatabase() {
    try{
        const response = await axios.get('http://localhost:3000/chat/getMessages');
        const dbMessages = response.data;

        const storedMessages = getMessagesFromLocalStorage();
        const lastStoredMessageId = storedMessages.length > 0 ? storedMessages[storedMessages.length - 1].id : 0;

        const newMessages = dbMessages.filter(message => message.id > lastStoredMessageId);

        const updatedMessages = [...storedMessages, ...newMessages];

        saveMessages(updatedMessages);

        updatedMessages.forEach(message => {
            displayMessage(message.name, message.message);
        });
    }
     catch(err){
        console.error("Error fetching messages: ", err);
    }
}

function getMessagesFromLocalStorage() {
    const messages = JSON.parse(localStorage.getItem('messages'));
    return messages ? messages : [];
}

async function getAllMessages() {
    const localStorageMessages = getMessagesFromLocalStorage();
    
    // Fetch messages from database only if local storage messages are not enough
    if (localStorageMessages.length < 10) {
        const dbMessages = await fetchMessagesFromDatabase();
        return [...localStorageMessages, ...dbMessages];
    } else {
        return localStorageMessages;
    }
}

window.onload = async function (){
    const fetchedActiveUsers = await fetchActiveUsers();
    updateActiveUsersUI(fetchedActiveUsers);
    await fetchMessagesFromDatabase();

    // setInterval(async () => {
    //     await fetchMessagesFromDatabase();
    // }, 1000);
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