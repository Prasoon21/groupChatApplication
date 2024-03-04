const token = localStorage.getItem('token');
const decodedToken = parseJwt(token);
console.log('decode ye aaya: ', decodedToken)
const currentUser = decodedToken.name;
const currentUserId = decodedToken.userId;
let lastClickedGroupId;
let activeUsers = [];
let joinedUsers = new Set();


window.addEventListener('DOMContentLoaded', async () => {
    fetchAndDisplayGroupList();
    // getAllMessages();
    //updateActiveUsersUI();
    await fetchMessagesFromDatabase()
})

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
        await fetchActiveUsers();
        console.log('display function m: ', activeUsers);
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
            if(!joinedUsers.has(user.fname)) {
                const userActive = document.createElement('div');
                userActive.classList.add('active-user-item');
                userActive.id = user.id;
                console.log('userid: ', user.id);
                console.log('username: ', user.fname);
                if(user.fname === currentUser){
                    userActive.textContent = `You joined`;
                } else{
                    userActive.textContent = `${user.fname} joined`;
                }
                
                messagesContainer.appendChild(userActive);
                joinedUsers.add(user.fname);
            }
            
        
        })
    } else{
        console.error('Active users data is not an array:', activeUsers);
    }
        
    
}

async function fetchActiveUsers() {
    try {
        const response = await axios.get('http://localhost:3000/user/getActiveUsers');
        console.log('response from get active request: ', response.data);
        activeUsers = response.data;
        // return response.data.activeUsers;
    } catch (err) {
        console.error("Error fetching active users: ", err);
        // return [];
    }
}

async function fetchMessagesFromDatabase() {
    try{
        const response = await axios.get('http://localhost:3000/chat/getMessages');
        const dbMessages = response.data;

        dbMessages.forEach(message => {
            displayMessage(message.name, message.message, message.groupId);
        });
        // const storedMessages = getMessagesFromLocalStorage();
        
        // if(storedMessages.length >= 20) {
        //     storedMessages.shift();
        // }

        // const lastStoredMessageId = storedMessages.length > 0 ? storedMessages[storedMessages.length - 1].id : 0;

        // const newMessages = dbMessages.filter(message => message.id > lastStoredMessageId);

        // const updatedMessages = [...storedMessages, ...newMessages];

        // //saveMessages(updatedMessages);

        // updatedMessages.forEach(message => {
        //     displayMessage(message.name, message.message, message.groupId);
        // });
    }
     catch(err){
        console.error("Error fetching messages: ", err);
    }
}

// function getMessagesFromLocalStorage() {
//     const messages = JSON.parse(localStorage.getItem('messages'));
    
//     return messages ? messages : [];
// }

// async function getAllMessages() {
//     const localStorageMessages = getMessagesFromLocalStorage();
    
//     // Fetch messages from database only if local storage messages are not enough
//     if (localStorageMessages.length <20) {
//         const dbMessages = await fetchMessagesFromDatabase();
//         return [...localStorageMessages, ...dbMessages];
//     } else {
//         return localStorageMessages;
//     }
// }



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
    const modal = document.getElementById('form-modal');
    modal.style.display = 'block';
    const selectUserDiv = document.getElementById('select-users');
    selectUserDiv.innerHTML = '';
    displayUserInCreateGroup()
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
        const selectedUsers = Array.from(document.querySelectorAll('input[name=selectedUsers]:checked'))
            .map(checkbox => checkbox.value);
        
        const groupListDiv = document.getElementById('grp-list-div');
    
        const res = await axios.post('http://localhost:3000/chat/create-group', {gname: gname, participants: selectedUsers},{ headers: { "Authorization": token} });

        console.log('response after group creation: ', res.data);
        const groupId = res.data.id;
        

        const groupItem = document.createElement('div');
        groupItem.classList.add('group-item');
    
        const groupName = document.createElement('span');
        groupName.textContent = gname;
        
        groupItem.appendChild(groupName);
        groupListDiv.appendChild(groupItem);

        groupItem.addEventListener('click', () => {
            console.log('group id: ', groupId);
            toggleMessageInput(groupId);
            groupItem.style.backgroundColor = 'antiquewhite';

            const allGroupItems = document.querySelectorAll('.group-item');

            allGroupItems.forEach(item => {
                if(item !== groupItem){
                    item.style.backgroundColor = '';
                }
            })
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
        const res = await axios.get('http://localhost:3000/chat/get-group', { headers: { "Authorization": token} })

        const groupList =  res.data;

        groupList.forEach(group => {
            console.log('response after getting from database: ', group.gname);
        })

        

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

async function toggleMessageInput(groupId){
    const messageInputContainer = document.querySelector('.message-input-container');
    const searchForm = document.getElementById('searchForm');
    const msgCol = document.getElementById('msgCol');
    const membersDiv = document.getElementById('membersDiv');

    if(messageInputContainer.style.display === 'none'){
        messageInputContainer.style.display = 'block';
        searchForm.style.display = 'block';
        msgCol.classList.remove('col-md-9');
        msgCol.classList.add('col-md-6');
        membersDiv.style.display = 'block';
        fetchMessagesFromDatabase()
        // hideWelcomeMessage();
        lastClickedGroupId = groupId;
        displayUserFromGroup(groupId);
        clearMessages()

        await fetchMessagesFromDatabase();
        

        console.log(`Message input displayed for group ${groupId}`);
    } else if(messageInputContainer.style.display === 'block'){
        searchForm.style.display = 'block';
        msgCol.classList.remove('col-md-9');
        msgCol.classList.add('col-md-6');
        membersDiv.style.display = 'block';
        lastClickedGroupId = groupId;
        displayUserFromGroup(groupId);
        clearMessages()
        await fetchMessagesFromDatabase();
        
        console.log(`Message input displayed for group ${groupId}`);
    
    }
}

function clearMessages() {
    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = ''; // Clear the messages container
}


async function displayUserInCreateGroup(){
    try{
        const response = await axios.get('http://localhost:3000/user');

        const allUsers = response.data;

        const filteredUsers = allUsers.filter(user => user.id !== currentUserId);

        console.log('saare saare: ', allUsers);

        const selectUserDiv = document.getElementById('select-users');
        

        filteredUsers.forEach(user => {
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

document.getElementById('searchForm').addEventListener('submit', async(e) => {
    e.preventDefault();
    const searchQuery = document.getElementById('searchQuery').value;
    try{
        console.log('ye seach m daala: ', searchQuery);
        const response = await axios.get(`http://localhost:3000/user/search-users?query=${searchQuery}`);
        displaySearchResults(response.data);
    } catch(error){
        console.error('Error searching users: ', error);
    }
});

function displaySearchResults(users){
    const searchResultsContainer = document.getElementById('searchResults');
    searchResultsContainer.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = `${user.fname} - ${user.emailId} - ${user.phoneNo}`;
        const addButton = document.createElement('button');
        addButton.textContent = 'Add to Group';
        addButton.addEventListener('click', () => addUserToGroup(user.id));
        userElement.appendChild(addButton);
        searchResultsContainer.appendChild(userElement);
    })
}

async function addUserToGroup(userId){
    console.log('adding user: ', userId);
    try{
        const response = await axios.post('http://localhost:3000/chat/add-user-to-group', {userId, lastClickedGroupId});
        console.log('User added to group: ', response.data);
    } catch(err){
        console.error('Error adding user to group: ', err);
    }
}

async function displayUserFromGroup(groupId){
    try{
        const memberList = document.getElementById('memberList');

        const res = await axios.get(`http://localhost:3000/chat/groupMember?groupId=${groupId}`);

        console.log('response of members request: ', res.data);

        const users = res.data;
        memberList.innerHTML = '';
        users.forEach(user => {
            const ul = document.createElement('ul');
            ul.classList.add('listOfMembers');

            const liChild = document.createElement('li');
            liChild.textContent = user.fname;

            console.log('username in group: ', user.fname);
            memberList.appendChild(ul);
            ul.appendChild(liChild);
        })



    } catch(error){
        console.log('error getting members of group: ', error);

    }
    

}