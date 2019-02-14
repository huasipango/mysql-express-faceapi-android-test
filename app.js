const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');
const app = express();
const morgan = require('morgan')

const port = 5000;

app.use(morgan('short'))
// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload()); // configure fileupload

const db = mysql.createConnection ({
    host: 'us-cdbr-iron-east-03.cleardb.net',
    user: 'bd5093cdc10674',
    password: '60272c99',
    database: 'heroku_e97bdfc7b2fa764'
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

app.get("/", (req,res)=>{
    console.log("Respondiendo a la página raíz.")
    res.send("Hello from ROOOOOT")
})

app.get("/users", (req,res) =>{
    const queryString = "select * from users"
    db.query(queryString, (err, rows, fields) => {
        res.json(rows)
    })
})

app.get("/users/:id", (req,res) => {
    console.log("Devolviendo usuario con id: " + req.params.id)
    const userId = req.params.id
    const queryString = "select * from users where user_id = ?"
    db.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.post("/auth", (req,res) => {
	var username = req.body.username;
	var password = req.body.password;
	if (username && password) {
		db.query('SELECT * FROM users WHERE user_username = ? AND user_password = ?', [username, password], (err, rows, fields) => {
			if (rows.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				res.sendStatus(200);
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});



app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});