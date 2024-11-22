const express = require('express');
const path = require('path');
const app = express();
const router = express.Router(); 
const dotenv = require('dotenv');
dotenv.config();

// database ========================================
const mysql = require("mysql2"); 
var dbConn = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

dbConn.connect(function (err) {
    if (err) throw err;
    console.log(`Connect DB: ${process.env.MYSQL_DATABASE}`);
});
// end database =====================================

const cors = require('cors');
app.use(cors());
app.use(router);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// post
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// method: GET (Select)
//":id" -> params
router.get('/products/:id', function (req, res) {
    let ProductID = req.params.id; 
    if (!ProductID) {
        return res.status(400).send({ error: true, message: 'Please provide student id.' });
    }
    
    dbConn.query(`SELECT * FROM product where ProductID = ?`, ProductID, function (error, results) {
        
        if (error) throw error;
        return res.send(results);
    });
});

// Testing search for a product by an ID
// Method: GET
// URL: http://localhost:8113/products/:id
// Params: Path variables -> Value = 2

// SELECT ALL product
router.get('/products', function (req, res) {
    dbConn.query('SELECT * FROM Product', function (error, results) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Product list.' });
        });
});

// Testing search for every product
// Method: GET
// URL: http://localhost:8113/products

// SELECT ALL admin
router.get('/admins', function (req, res) {
    dbConn.query('SELECT * FROM admins', function (error, results) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'admin list.' });
        });
});

// Testing search for every admin
// Method: GET
// URL: http://localhost:8113/admins

router.delete('/product-delete', function (req, res){
    let product = req.body.product;
    let productid = req.body.product.ProductID;
    console.log(product);
    if(!product){
        return res.status(404).send({ error: product, status:404, message: 'Please provide product ID' });
    }
    dbConn.query("SELECT * FROM Product WHERE ProductID = ?", [productid], function (error, results) {
        if (error) throw error;
        // If username or password doesn't match database
        if (results.length == 0) {
            return res.status(401).send({ //400 Bad Request: req from client incorrect ex. wrong JSON or wrong parameters 
                error: true,
                message: 'Invalid delete',
                status: 401
            });
        }
        else {
            dbConn.query("delete from Product where ProductID = ?", [productid], function (error, deleteResults){
                if(error) throw error;
                return res.status(200).send({error: false, status:200, data: deleteResults.affectedRows, message: 'Product has been deleted successfully.'})
            }); 
        }
    });
}); 

// Testing delete a product by an ID and name
// Method: DELETE
// URL: http://localhost:8113/product-delete
// Body: raw JSON
//{
//   "product":{
//       "ProductID": 1,
//       "Pname": "mingyu"
//   }
//}

router.put('/product-edit', (req, res) => {
    let product = req.body.Product;
    let ProductName = req.body.Product.PName;
    let ProductID = req.body.Product.ProductID;
    console.log(ProductID);
    console.log(product);
    if(!ProductID || !product || !ProductName){
        return res.status(404).send({ error: product, status:404, message: 'Please provide all information' });
    }
    dbConn.query("select * from product where ProductID = ?", ProductID, function (error, results){
        if (results.length == 0) { //if not have this product's id
            return res.status(401).send({ 
                error: true,
                message: 'Invalid',
                status: 401 
            });
        }else{
            dbConn.query("update product set ? where ProductID = ?", [product, ProductID], function (error, results){
            if(error) return res.status(400).send({error: true, status:400});
            return res.status(200).send({error: false, status:200, data: results.affectedRows, message: 'Product has been updated successfully.'})
            });
        }
    })

});

// Testing edit a name of the product by an ID
// Method: PUT
// URL: http://localhost:8113/product-edit
// Body: raw JSON
// {
//     "Product":{
//         "ProductID": 3,
//         "PName": "webpro" 
//     }
// }

router.post('/add-product', function (req, res) {
    const id = req.body.id;
    const name = req.body.name; 
    const description = req.body.description_p;
    const price = req.body.price;
    // console.log(email)
    // Input validation (optional but recommended) 
    if (!id || !name || !description || !price) {
        return res.status(400).send({
            error: true,
            message: 'Please enter id, name, description, and price'
        }); // <--- Added closing curly brace for the if block
    }
    console.log(id + " " + name + " " + description + " " + price )
    dbConn.execute("INSERT INTO Product (ProductID, Pname, Description_p, Price) VALUES (?, ?, ?, ?)", [id, name, description, price], function (error, results) {
        if (error) throw error;

        // If username or password doesn't match database
        return res.send({
            error: false,
            data: results.affectedRows,
            message: 'Successfully Created!',  
            status: 200
        }); 

    });
});

// Testing add a product by typing ID, name, descriptionn, price
// Method: POST
// URL: http://localhost:8113/add-product
// Body: raw JSON
//{
// "id": 89,
// "name": "PYE",
// "description_p": "A sunglasses with a black color which is very fashionable.",
// "price": "1717"
//}
 
router.delete('/admin-delete', function (req, res){
    let admin = req.body.admin;
    let username = req.body.admin.Username;
    let password = req.body.admin.AdPassword;
    console.log(admin);
    if(!username || !password){
        return res.status(404).send({ error: admin, status:404, message: 'Please provide username and password' });
    }
    dbConn.query("SELECT * FROM Admins WHERE Username = ? AND AdPassword = ?", [username, password], function (error, results) {
        if (error) throw error;
        // If username or password doesn't match database
        if (results.length == 0) {
            return res.status(401).send({ //400 Bad Request: req from client incorrect ex. wrong JSON or wrong parameters 
                error: true,
                message: 'Invalid log in',
                status: 401
            });
        }
        else {
            dbConn.query("delete from admins where username = ? and AdPassword = ?", [username,password], function (error, deleteResults){
                if(error) throw error;
                return res.status(200).send({error: false, status:200, data: deleteResults.affectedRows, message: 'Admin has been deleted successfully.'})
            }); 
        }
    });
}); 

// Testing delete an admin by typing username and password
// Method: DELETE
// URL: http://localhost:8113/admin-delete
// Body: raw JSON
// {
//     "admin":{
//         "Username": "Browning",
//         "AdPassword": "aaa"
//     }
// }


router.put('/admin-edit', (req, res) => {
    let admin = req.body.admin;
    let username = req.body.admin.Username;
    let name = req.body.admin.AdName;
    console.log(admin);
    if(!username || !admin){
        return res.status(404).send({ error: admin, status:404, message: 'Please provide all information' });
    }
    if(!name){
        return res.status(404).send({ error: admin, status:404, message: 'Please provide all information' });
    }
    dbConn.query("select * from admins where username = ?", username, function (error, results){
        if (results.length == 0) {
            return res.status(401).send({ //400 Bad Request: req from client incorrect ex. wrong JSON or wrong parameters 
                error: true,
                message: 'Invalid',
                status: 401
            });
        }
    })
    dbConn.query("update admins set ? where username = ?", [admin, username], function (error, results){
        if(error) return res.status(400);
        return res.status(200).send({error: false, status:200, data: results.affectedRows, message: 'Admin has been updated successfully.'})
    });
});

// Testing edit an admin by typing username and password
// Method: PUT
// URL: http://localhost:8113/admin-edit
// Body: raw JSON
// {
//     "admin":{
//         "Username": "Grafton",
//         "AdPassword": "aaa",
//         "AdName": "webpro"
//     }
// }

router.post('/admin-login', (req, res) => {
    let admin_username = req.body.username;
    let admin_password = req.body.password;
    console.log('admin login:', admin_username, `at ${Date()} ${Date.now()}`);
    if (!admin_username || !admin_password) {
        return res.status(400).send({
            error: true,
            message: 'Please enter username and password'
        });
    }
    dbConn.query("SELECT * FROM Admins WHERE Username = ? AND AdPassword = ?", [admin_username, admin_password], function (error, results) {
        if (error) throw error;
        // If username or password doesn't match database
        if (results.length == 0) {
            return res.status(400).send({ //400 Bad Request: req from client incorrect ex. wrong JSON or wrong parameters 
                error: true,
                message: 'Invalid log in',
                status: 400
            });
        }
        else {
            return res.status(200).send({
                error: false,
                data: results,
                message: 'Successfully log in',
                status: 200
            });
        }
    });
});

// Testing login an admin by typing username and password (check that they can login or not)
// Method: POST
// URL: http://localhost:8113/admin-login
// {
//     "username": "Grafton",
//     "password": "aaa"
// }

router.post('/add-admin', function (req, res) {
    const email = req.body.email;
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    console.log(email)
    // Input validation (optional but recommended)
    if (!email || !name || !username || !password) {
        return res.status(400).send({
            error: true,
            message: 'Please enter username, email, and password'
        }); // <--- Added closing curly brace for the if block
    }
    console.log(email + " " + name)
    dbConn.execute("INSERT INTO Admins (Email, AdName, Username, AdPassword) VALUES (?,?, ?, ?)", [email, name, username, password], function (error, results) {
        if (error) return res.status(401).send({
            error: true,
            status: 401
        });

        // If username or password doesn't match database
        return res.send({
            error: false, 
            data: results.affectedRows,
            message: 'Successfully Created!',
            status: 200
        });
 
    });
});

// Testing add an admin by typing username, password, email, name 
// Method: POST
// URL: http://localhost:8113/add-admin
// {
//     "username": "webpro",
//     "password": "aaa",
//     "email": "webpro@gmail.com",
//     "name": "web"
// }

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


 