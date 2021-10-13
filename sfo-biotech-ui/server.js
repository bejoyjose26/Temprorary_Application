const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');

//SESSION controll
app.use(cors({
  orgin: ["http://0.0.0.0:3000/"],
  methods: ["GET","POST"],
  credentials: true,
}));



app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  key: "userId",
  secret: "sfo-biotech-applicatrion-ui",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expire: 60*60*60
  },
}));
// DB connection
const db = mysql.createConnection({
  user: "root",
  password: "root",
  host: "localhost",
  database: "sys",
});




//Constants
const port = process.env.PORT || 5000;
const saltRound = 10;

app.post('/register', (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt.hash(password,saltRound, (error, passwordHash)=>{
    if(error){
      console.log(error);
    }
    db.query("Insert into user (first_name, last_name, email, password) VALUES (?,?,?,?)",[firstName, lastName, email, passwordHash], (error,result) =>{
      if(error){
        console.log(error);
      }else{
        res.send(result);
      }
    });
  });

 
});

app.get('/login', (req, res) => {
  if(req.session.user){
    res.send({loggesIn: true, user: req.session.user});
  }else{
    res.send({loggesIn: false});
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //console.log(firstName);
  db.query("SELECT * from user WHERE email=?",[email], (error,result) =>{
    if(error){
      res.send({error: error});
    }

    if(result.length >0){
      bcrypt.compare(password, result[0].password, (err,response)=>{
        if(response){
          const id  = result[0].id;
          const token = jwt.sign({id}, "jwtSecret", {
            expiresIn: 300,
          })
          req.session.user = result
          //console.log(req.session.user);
          res.send({auth: true, token: token, result: result});
        }else{
          res.send({message:"Wrong Username/Password"})
        }
      });
    }else{
      res.send({message:"User doesn't exist"})
    }
    
    
  });

});

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});

app.listen(port, () => console.log(`Listening on port ${port}`));