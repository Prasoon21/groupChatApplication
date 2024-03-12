require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const cors = require('cors');

const userRoute = require('./routes/userRoute');
const chatRoute = require('./routes/chatRoute');
const resetPasswordRoute = require('./routes/resetPassword');

const sequelize = require('./util/database');

const User = require('./models/user');
const Chat = require('./models/chats');
const Forgotpassword = require('./models/forgotpassword');
const Group = require('./models/group');
const UserGroup = require('./models/usergroup');
const { Socket } = require('dgram');

User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });

User.hasMany(Chat);
Chat.belongsTo(User);

Group.hasMany(Chat);
Chat.belongsTo(Group);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static('public'));

app.use('/user', userRoute);
app.use('/chat', chatRoute);
app.use('/password', resetPasswordRoute);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
})

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('server is runnnng on port ', process.env.PORT);
    
});
    
