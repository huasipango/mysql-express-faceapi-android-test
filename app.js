const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
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
const router = express.Router();
const request = require('request');
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

app.get("/users/info/:username", (req,res) => {
    console.log("Devolviendo usuario con nombre: " + req.params.username)
    const userId = req.params.username
    const queryString = "select users.user_surnames, users.user_given_names, pictures.picture_name, pictures.picture_azure_id, users.users_voiceit_id from pictures, users where pictures.picture_id=users.pictures_picture_id and users.user_username=?;"
    pool.query(queryString, [userId], (err, rows, fields) => {
        res.json(rows)
    })
    //res.end()
})

app.get("/userFaceId/:picture", (req,res) => {
    console.log("Devolviendo FaceId de Azure de la foto: " + req.params.picture)
    var pictureName = req.params.picture
    console.log(pictureName)
    //CONSULTO EL FACEID
    const queryString = "SELECT picture_azure_id FROM pictures where picture_name='"+pictureName+"'"
    pool.query(queryString, (err, rows, fields) => {
        if(err)
            throw err;
        else
        {
            res.json(rows)
        }
        res.end()
    })
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
        //res.json(req.file);
        request({
            url: 'https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnfaceAttributes=emotion,smile,blur,noise,exposure',
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': '26e242a2aaf448839cc5eb076337c4f0',
              'content-type' : 'application/octet-stream',
            },
            encoding: null,
            body: fs.createReadStream('C://wamp/www/mysql-express-faceapi-android-test/public/assets/img/'+file_name)
           }, (error, response, body) => {
                if (error) {
                   res.json({name : error});
                } else {
                  var obj = JSON.parse(response.body.toString())
                  var faceId=obj[0].faceId//Recupero el faceid de la persona en la foto
                  pool.query('INSERT INTO pictures (picture_name, picture_azure_id) VALUES(?,?)', [file_name,faceId], (err, rows, fields) => {
                    if (err) {
                        throw err;
                    }else{ 
                        console.log('Ingreso correcto de la foto: nombre y faceId de Azure')
                        res.send('La foto ha sido ingresada correctamente.')
                    } 
                })
                
                }
           });   
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
    var auth = new Buffer("key_f08f39b92a67468eaf95809fc1734bfb" + ':' + "tok_c2f15a5641154bdc84cd8eb8166c04b0").toString('base64');
    

    //=============================
    if(nombres && apellidos){

        //=============== si el formulario es correcto entra
        request({
            url: 'https://api.voiceit.io/users',
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + auth        
            }        
           }, (error, response, body) => {
                if (error) {
                   res.json({name : error});
                } else {
                  var obj = JSON.parse(response.body.toString())
                  var voiceitId=obj.userId//Recupero el faceid de la persona en la foto
                    
                  pool.query('INSERT INTO users (user_username, user_password, user_surnames, user_given_names, pictures_picture_id, users_voiceit_id) VALUES(?,?,?,?,?,?)', [username, password, nombres, apellidos, fotoId, voiceitId], (err, rows, fields) => {
                    if(err)
                        throw err;
                    else
                        console.log('Ingreso correcto de persona')
                    res.send('Ingreso correcto de persona')
                    res.end()
                })
                }
           });
        //===============
        
    }else{
        res.send('Please enter the Full Name!');
        res.end();
    }
})

app.listen(PORT, () => {
    console.log('Listening at ' + PORT );
});
