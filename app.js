//importing the packages
const { createServer } = require('http');
const { Server } = require('socket.io');
const {instrument} = require('@socket.io/admin-ui');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

//importing the modules
const sequelize = require('./util/database');
const User = require('./models/user');
const Chat = require('./models/chats');
const Forgotpassword = require('./models/forgotpassword');
const Group = require('./models/group');
const UserGroup = require('./models/usergroup');
const chatController = require('./controller/chatController');

//importing the services
const webSocketService = require('./services/webSocket');


//importing the routes
const userRoute = require('./routes/userRoute');
const chatRoute = require('./routes/chatRoute');
const resetPasswordRoute = require('./routes/resetPassword');

const accessLogStream = fs.createWriteStream('./access.log', { flags: 'a'});

const app = express();
app.use(morgan('combined', { stream: accessLogStream }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/user', userRoute);
app.use('/chat', chatRoute);
app.use('/password', resetPasswordRoute);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
})


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io",],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', (chat) => {
        //JSON.parse(chat);
        console.log('Message Received: ', typeof(chat));
        
        chatController.postMessage(chat, io);
        
    })

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
})

//for permanent monitoring on socket-io-admin
instrument(io, { auth: false })


User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

User.hasMany(Chat);
Chat.belongsTo(User);

Group.hasMany(Chat);
Chat.belongsTo(Group);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);


const PORT = process.env.PORT || 3000;
async function initiate() {
    try{
        const res = await sequelize.sync({force:false});
        httpServer.listen(PORT, () => {
            console.log('server is runnnng on port ', PORT);
        });
    } catch(error){
        console.error("Error during server initialization: ", error);
        process.exit(1);
    }
}
initiate();

    
