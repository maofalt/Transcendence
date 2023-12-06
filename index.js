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

// app.get('/users/:id', (req, res) => {
//     const id = parseInt( req.params.id );
//     const users = users.find(users => users.id === id);
//     res.status(200).json(users)
// });


// The server can listen the choosed port
const PORT = 8000;
app.listen(PORT, () => { 
    console.log('Server is listen') });

