require('dotenv').config()

const cookieParser = require('cookie-parser');
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const fs = require('fs')
const User = require('./models/user')

//connect to mongodb
const dbURL = 'mongodb+srv://user1:user1@bitsbid-data.3gwzk.mongodb.net/BitsBid-Data?retryWrites=true&w=majority'
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(res => console.log("Connected to the database"))
  .catch(err => console.log(err))


//google-auth
const {OAuth2Client} = require('google-auth-library');
CLIENT_ID = '994435866614-0ogkna7376okjda5sm4bcbpds519k6o4.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 3000;

//middlewares
app.set('view engine','ejs');
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));


//routes
app.get('/',(req,res)=>{
    res.render('collection')
})

app.get('/login', (req,res) =>{
    res.render('login')
})

app.post('/login', (req,res)=>{
    //sending token to server
    let token = req.body.token;
    // console.log(token);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, 
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // console.log(`${payload['given_name']} 's account is being verified`);
      }
      verify()
      .then(()=>{
          res.cookie('session-token',token);
          res.send('success')
      })
      .catch(console.error);
})

app.get('/dashboard',checkAuthenticate ,(req,res)=>{
    let user = req.user
    res.render('dashboard',{user});
})

app.get('/signout',(req,res)=>{
    res.clearCookie('session-token');
    res.redirect('/login')
})

function checkAuthenticate(req,res,next){
    let token = req.cookies['session-token'];

    let user = {};

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
        console.log(user.picture);
        const userobj = new User({
            name : user.name,
            email : user.email,
            picture : user.picture
        })
        userobj.save();
        console.log(userobj);
        // userobj.picture.data : fs.readFileSync(user.picture);
      }
      verify()
      .then(()=>{
          req.user = user
          next();
      })
      .catch(err =>{
          res.redirect('/login')
      });
}
app.listen(PORT, ()=>{
    console.log(`listening to the port ${PORT}`);
})