const express = require('express');
const app = express();
app.use(express.json());
const { Pool } = require('pg');
const path = require('path');
app.use(express.static(path.join(__dirname, '../public/local/')));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.get("/", (req, res) => res.send("Welcome to the BEST pong game ever!"));

const PORT = 3001;
app.listen(PORT, () => { 
    console.log('Server listening on port 3001') });