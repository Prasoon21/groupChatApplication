let token = localStorage.getItem('token');
let activeUsers = [];
let joinedUsers = new Set();
let lastClickedGroupId;


window.onload = async function (){


    // const fetchedActiveUsers = await fetchActiveUsers();
    // updateActiveUsersUI(fetchedActiveUsers, '');
    displayWelcomeMessage();

    await fetchAndDisplayGroupList();
    //await fetchMessagesFromDatabase();

    // setInterval(async () => {
    //     await fetchMessagesFromDatabase();
    // }, 1000);
}

function displayWelcomeMessage() {
    const messagesContainer = document.getElementById('messagesContainer');
    const welcomeMessage = document.createElement('div');
    welcomeMessage.classList.add('message');
    welcomeMessage.textContent = 'Welcome to Group Chat App!';
    messagesContainer.appendChild(welcomeMessage);
}

async function newGrp(){
    hideWelcomeMessage();
    modal.style.display = 'block';
}

function hideWelcomeMessage() {
    const messagesContainer = document.getElementById('messagesContainer');
    const welcomeMessage = messagesContainer.querySelector('.message');
    if(welcomeMessage){
        welcomeMessage.style.display = 'none';
    }
}



function getStoredMessages() {
    const storedMessages = localStorage.getItem('messages');
    return storedMessages ? JSON.parse(storedMessages) : [];
}

function saveMessages(messages) {
    const latestMessages = messages.slice(-20);
    localStorage.setItem('messages', JSON.stringify(latestMessages));
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
        console.log('is group m jaaega msg: ', lastClickedGroupId)
    
        if(lastClickedGroupId){
            const chat = {
                name: name,
                trimmedMessage: trimmedMessage,
                groupId: lastClickedGroupId
                
            };
    
            console.log(chat);
            const res = await axios.post('http://localhost:3000/chat/message', chat, { headers: { "Authorization": token} });

            if(res.data && res.data.message && res.data.name && res.data.groupId) {
                const sentMessage = res.data.message;
                const sentbyName = res.data.name;
                const sentBygroupid = res.data.groupId;
                console.log('Sent message: ', sentMessage);
                console.log('message send by: ', sentbyName);
                console.log('groupid konsi h: ', sentBygroupid);
                displayMessage(sentbyName, sentMessage, sentBygroupid);
            } else{
                console.log('message data not found in api response');
            }
        } else{
            console.log('no group selected to send the message');
        }
        
        
        
    } catch(err){
        console.log('error sending message: ', err);
    }
    
}

async function displayMessage(name, message, groupId) {
    try{
        // console.log('current: ', currentUser);

        // console.log('called parameter: ', name);
        if(message !== ''){
            //console.log('sent message --> ', message);
            const messagesContainer = document.getElementById('messagesContainer');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            
            if(groupId === lastClickedGroupId){
                if(name === currentUser){
                    messageElement.textContent = `You: ${message}`;
                } else{
                    messageElement.textContent = `${name}: ${message}`;
                }
                
                messagesContainer.appendChild(messageElement);

                messageInput.value = '';
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
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

async function fetchMessagesFromDatabase(groupId) {
    try{
        const response = await axios.get('http://localhost:3000/chat/getMessages');
        const dbMessages = response.data;

        const storedMessages = getMessagesFromLocalStorage();
        
        if(storedMessages.length >= 20) {
            storedMessages.shift();
        }

        const lastStoredMessageId = storedMessages.length > 0 ? storedMessages[storedMessages.length - 1].id : 0;

        const newMessages = dbMessages.filter(message => message.id > lastStoredMessageId);

        const updatedMessages = [...storedMessages, ...newMessages];

        saveMessages(updatedMessages);

        updatedMessages.forEach(message => {
            displayMessage(message.name, message.message, message.groupId);
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
    if (localStorageMessages.length <20) {
        const dbMessages = await fetchMessagesFromDatabase();
        return [...localStorageMessages, ...dbMessages];
    } else {
        return localStorageMessages;
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

const modal = document.getElementById('form-modal');
const span = document.getElementsByClassName('close')[0];

async function newGrp(){
    modal.style.display = 'block';
    displayUsers()
}

span.onclick = function () {
    modal.style.display = 'none';
}

window.onclick = function(event){
    if (event.target == modal) {
        modal.style.display = "none";
      }
}

async function createGroup(event){
    try{
        event.preventDefault();
        const gname = document.getElementById('gname').value;
        const groupListDiv = document.getElementById('grp-list-div');
    
        const res = await axios.post('http://localhost:3000/chat/create-group', {
            gname: gname
        });

        console.log('response after group creation: ', res.data);
        const groupId = res.data.id;

        const groupItem = document.createElement('div');
        groupItem.classList.add('group-item');
    
        const groupName = document.createElement('span');
        groupName.textContent = gname;
        
        groupItem.appendChild(groupName);
        groupListDiv.appendChild(groupItem);

        groupItem.addEventListener('click', () => {
            toggleMessageInput(groupId);
        })

        document.getElementById('gname').value = '';
        // fetchAndDisplayGroupList();
    }
    catch(err){
        console.log(err);
    }
}

async function fetchAndDisplayGroupList(){
    try{
        const res = await axios.get('http://localhost:3000/chat/get-group')

        const groupRes = res.data;

        groupRes.forEach(group => {
            console.log('response after getting from database: ', group.gname);
        })

        const groupList =  res.data;

        displayGroups(groupList);
    } catch(err){
        console.log('error fetching group list: ', err);
    }
}

async function displayGroups(groupList){
    const groupListDiv = document.getElementById('grp-list-div');
    console.log('displaying group lists');
    groupList.forEach(group => {
        const groupItem = document.createElement('div');
        groupItem.classList.add('group-item');

        const groupName = document.createElement('span');
        groupName.textContent = group.gname;

        groupItem.appendChild(groupName);
        groupListDiv.appendChild(groupItem);

        groupItem.addEventListener('click', () => {
            toggleMessageInput(group.id);
            groupItem.style.backgroundColor = 'antiquewhite';

            const allGroupItems = document.querySelectorAll('.group-item');

            allGroupItems.forEach(item => {
                if (item !== groupItem) {
                    item.style.backgroundColor = ''; // Reset background color
                }
            })
        })
    })
}

function toggleMessageInput(groupId){
    const messageInputContainer = document.querySelector('.message-input-container');
    if(messageInputContainer.style.display === 'none'){
        messageInputContainer.style.display = 'block';
        hideWelcomeMessage();
        lastClickedGroupId = groupId;
        
        fetchMessagesFromDatabase(groupId);
        clearMessages()
        

        console.log(`Message input displayed for group ${groupId}`);
    } else if(messageInputContainer.style.display === 'block'){
        
        lastClickedGroupId = groupId;
        fetchMessagesFromDatabase(groupId);
        clearMessages()
        console.log(`Message input displayed for group ${groupId}`);
    
    }
}

function clearMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = ''; // Clear the messages container
}

async function fetchUsers(){
    try{
        

        console.log(response.data);
        return response.data;
    } catch(err){

    }
}

async function displayUsers(){
    try{
        const response = await axios.get('http://localhost:3000/user');

        const allUsers = response.data;

        console.log('saare saare: ', allUsers);

        const selectUserDiv = document.getElementById('select-users');
        

        allUsers.forEach(user => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'selectedUsers';
            checkbox.value = user.id;

            const label = document.createElement('label');
            label.textContent = user.fname;
            label.appendChild(checkbox);
            

            selectUserDiv.appendChild(label);
            
        });
    } catch(err){
        console.log('something went wrong: ', err);
    }
    
}
