const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.static('public')); // Assurez-vous que vos fichiers HTML/JS/CSS sont dans un dossier 'public'

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});