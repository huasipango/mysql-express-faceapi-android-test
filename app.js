const express = require('express');
const mysql = require('mysql');
const pool = mysql.createPool ({
    connectionLimit : 10,
    host: 'us-cdbr-iron-east-03.cleardb.net',
    user: 'bd5093cdc10674',
    password: '60272c99',
    database: 'heroku_e97bdfc7b2fa764',
});
const morgan = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const accepted_extensions = ['jpg', 'png', 'gif'];
const Request = require("request");
var file_name='';
var upload = multer({ 
        storage: multer.diskStorage({
        destination: function(req, file, callback) {
        callback(null, 'public/assets/img/');
    },
    filename: (req, file, cb) => {
        var datetimestamp = Date.now();
        file_name = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
        cb(null, file_name);
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

//AZURE
const az_token="66bb773690474b0692e694f4659f727d";


app.use(express.static('public'))
app.use(morgan('short'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// // connect to database
// db.connect((err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Connected to database');
// })
// global.db = db;

app.get("/users", (req,res) =>{
    const queryString = "select * from users"
    pool.query(queryString, (err, rows, fields) => {
        res.json(rows)
    })
})

app.get("/users/:id", (req,res) => {
    console.log("Devolviendo usuario con id: " + req.params.id)
    const userId = req.params.id
    const queryString = "select * from users where user_id = ?"
    pool.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.get("/", (req,res) => {
    res.send('Hola con todos.')
    //res.end()
})

app.get("/userPhoto/:username", (req,res) => {
    console.log("Devolviendo usuario con nombre: " + req.params.username)
    const userId = req.params.username
    const queryString = "select users.user_surnames, users.user_given_names, pictures.picture_name from pictures, users where pictures.picture_id=users.pictures_picture_id and users.user_username=?;"
    pool.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.post("/auth", (req,res) => {
	var username = req.body.username;
    var password = req.body.password;
    // console.log(username+' '+password)
	if (username && password) {
		pool.query('SELECT * FROM users WHERE user_username = ? AND user_password = ?', [username, password], (err, rows, fields) => {
			if (rows.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				res.send("true")
			} else {
                res.send("false")
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
        pool.query('INSERT INTO pictures (picture_name) VALUES(?)', file_name, (err, rows, fields) => {
            if (err) {
                throw err;
            }else{ 
                console.log('Ingreso correcto de foto')//FACE API --->
                // var face_api_url="https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnfaceAttributes=emotion,smile,blur,noise,exposure"
                // Request.post({
                //     "headers": { "content-type": "application/json", "Ocp-Apim-Subscription-Key": "26e242a2aaf448839cc5eb076337c4f0" },
                //     "url": "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnfaceAttributes=emotion,smile,blur,noise,exposure",
                //     "body": JSON.stringify({
                //         "url": "https://raw.githubusercontent.com/huasipango/kradac-practices/master/azure-face-api-test/foto4.png"
                //     })
                // }, (error, response, body) => {
                //     if(error) {
                //         return console.dir(error);
                //     }
                //     console.dir(JSON.parse(body));
                // });
            } 
        })
    }
    else throw 'error';
})

app.post("/adduser", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var nombres = req.body.nombres;
    var apellidos = req.body.apellidos;
    var fotoId = req.body.fotoId;
    // console.log(nombres+" "+apellidos+" "+username)
    if(nombres && apellidos){
        pool.query('INSERT INTO users (user_username, user_password, user_surnames, user_given_names, pictures_picture_id) VALUES(?,?,?,?,?)', [username, password, nombres, apellidos, fotoId], (err, rows, fields) => {
            if(err)
                throw err;
            else
                console.log('Ingreso correcto de persona')
            res.send('Ingreso correcto de persona')
            res.end()
        })
    }else{
        res.send('Please enter the Full Name!');
        res.end();
    }
})

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});
