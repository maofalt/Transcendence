// Import express libin the code and "app" will init the obj express
const express = require('express');
const app = express();

app.use(express.json());

//users.json file
const users = require('./users.json')

app.get('/users', (req,res) => { 
    //here i need to integrate the database to takeauser list
    res.status(200).json(users)
});

app.get('/users/:id', (req, res) => {
    const id = parseInt( req.params.id );
    const user = users.find(user => user.id === id);

    // Manage if the user isnot find 
    if (!user) {
        return res.status(404).send('User not found');
    }

    res.status(200).json(user);
});

// To create a new user with POST
app.post('/users', (req, res) => {
    users.push(req.body);
    res.status(200).json(users);
});

app.put('/users/:id', (req,res) => {    
    const id = parseInt(req.params.id);  
    let userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).send('User not found');
    }

    users[userIndex] = {
        ...users[userIndex],
        ...req.body
    }
    
    res.status(200).json(users[userIndex]);
});

app.delete('/users/:id', (req,res) => {    
    const id = parseInt(req.params.id);    
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).send('User not found');
    }

    users.splice(userIndex, 1);
    res.status(200).json(users)
});

// The server can listen the choosed port
const PORT = 8000;
app.listen(PORT, () => { 
    console.log('Server is listen') });