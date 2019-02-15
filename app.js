const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');
const busboy = require("then-busboy");
const morgan = require('morgan');
const formidable = require('formidable');

const port = 5000;

const app = express();

app.use(morgan('short'))
// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
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
        res.json({notes: "Hola"})
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
});

app.post('/upload2', function (req, res){
    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });

    var sql = "INSERT INTO `pictures`(`picture_name`) VALUES ('" + file.name + "')";
 
    var query = db.query(sql, function(err, result) {
        res.send('Ingreso correcto.'+result.insertId);
    });
    
    });

app.post("/upload", (req,res) => {
        message = '';
   if(req.method == "POST"){
    //   var post  = req.body;
    //   var name= post.user_name;
    //   var pass= post.password;
    //   var fname= post.first_name;
    //   var lname= post.last_name;
    //   var mob= post.mob_no;
 
	  if (!req.files)
		return res.status(400).send('No files were uploaded.');
 
		let file = req.files.uploaded_image;
		let img_name=file.name;
 
	  	 if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/jpg" ){
                                 
              file.mv('public/assets/img/'+file.name, function(err) {
                             
	              if (err)
	                return res.status(500).send(err);
      				var sql = "INSERT INTO `pictures`(`picture_name`) VALUES ('" + img_name + "')";
 
    						var query = db.query(sql, function(err, result) {
                                res.send('Ingreso correcto.'+result.insertId);
    						});
					   });
          } else {
            message = "This format is not allowed , please upload file with '.png','.jpg'";
            res.send(message);
          }
   } else {
      res.send("Vista principal");
   }
 

});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
