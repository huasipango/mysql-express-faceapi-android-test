const express = require('express');
const mysql = require('mysql');
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'faceemotions'
});
const morgan = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const accepted_extensions = ['jpg', 'png', 'gif'];
var upload = multer({ 
        storage: multer.diskStorage({
        destination: function(req, file, callback) {
        callback(null, 'public/assets/img/');
    },
    filename: (req, file, cb) => {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
  }),fileFilter: (req, file, cb) => {
    if (accepted_extensions.some(ext => file.originalname.endsWith("." + ext))) {
        return cb(null, true);
    }
    return cb(new Error('Only ' + accepted_extensions.join(", ") + ' files are allowed!'));
}
});
const app = express();
const PORT = 5000;

app.use(express.static('public'))
app.use(morgan('short'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
})
global.db = db;

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
    console.log(username+' '+password)
	if (username && password) {
		db.query('SELECT * FROM users WHERE user_username = ? AND user_password = ?', [username, password], (err, rows, fields) => {
			if (rows.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				res.status(200).send('Encontrado.');
			} else {
                res.status(300).send('No existe.');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
})

app.post('/upload', upload.single('photo'), (req, res) => {
    if(req.file) {
        res.json(req.file);
    }
    else throw 'error';
})

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});
