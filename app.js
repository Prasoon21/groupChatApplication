const express = require('express');

const app = express();

const userRoute = require('./routes/userRoute');

app.use(express.json());

app.use('/user', userRoute);

app.listen(3000, () => {
    console.log('server is runnnng on port 3000');
    app.get('/user', (req, res) => {
        res.send('<h1>welcome to chat app</h1>')
    })
})