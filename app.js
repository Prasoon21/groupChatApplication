require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const cors = require('cors');

const userRoute = require('./routes/userRoute');
const chatRoute = require('./routes/chatRoute');
const resetPasswordRoute = require('./routes/resetPassword');

const sequelize = require('./util/database');

const User = require('./models/user');
const Chat = require('./models/chats');

User.hasMany(Chat);
Chat.belongsTo(User);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static('public'));

app.use('/user', userRoute);
app.use('/chat', chatRoute);
app.use('/password', resetPasswordRoute);

sequelize.sync()
    .then(() => {
        console.log('Database synced successfully');
        app.listen(process.env.PORT || 3000, () => {
            console.log('server is runnnng on port ', process.env.PORT);
            app.get('/', (req, res) => {
                res.sendFile(path.join(__dirname, 'views', 'login.html'));
            })
        });
    })
    .catch(err => console.log(err));
