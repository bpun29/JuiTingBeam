const path = require("path");
const express = require("express");
const app = express();
const cors = require('cors');
const mysql = require("mysql2");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Load environment varirom .env file
dotenv.config();


// Use Router object to handle routes
const router = express.Router()
app.use(router)
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true})) 

//image
app.use(express.static(path.join(__dirname, '/public'))); 


router.get('/', (req, res) => {
    console.log("going team")
    res.sendFile(path.join(__dirname, '/teampage.html'));
});

router.get('/teampage', (req, res) => {
    console.log("going team page")
    res.sendFile(path.join(__dirname, '/teampage.html'));
});

const port = 8014
app.listen(port, () => {
        console.log(`Server listening on port: ${port}`)
});

