const express = require('express');
const app = express();
const userModel = require('./models/users');
const postModel = require("./models/post");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.get('', (req, resp)=>{
    resp.render("index")
});
app.get('/login', (req, resp)=>{
    resp.render("login")
});
app.get('/profile', isLoggedIn ,(req, resp)=>{
    console.log(req.user);
    resp.render("login");
});

app.post('/ragister', async (req, resp)=>{
    let {name, username, age, password, email} = req.body;
    let user = await userModel.findOne({email});
    if(user) return resp.status(500).send("user already ragister")
    

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash) =>{
            await userModel.create({
                name,
                username,
                age,
                email,
                password:hash
            });

           let token = jwt.sign({email: email, userid: username}, "shhh")
           resp.cookie("token", token);
           resp.send("Ragistered")
            
        });
    });
});


app.post('/login', async (req, resp)=>{
    let {password, email} = req.body;

    let user = await userModel.findOne({email});
    if(!user) return resp.status(500).send("Something went Wrong");


    bcrypt.compare(password, user.password , function(err, result){
    if(result){
        let token = jwt.sign({email: email, password:password}, "shhh")
           resp.cookie("token", token);
        resp.status(200).send("you can login")
    }
    else resp.redirect("/login");
    })
});

app.get('/logout', (req, resp)=>{
    resp.cookie("token","")
    resp.redirect("/login")
})  

function isLoggedIn(req, resp, next){
    if(req.cookies.token === "") resp.send("you must be logged in"); 
    else{
        let data = jwt.verify(req.cookies.token, "shhh")
        req.user = data;
    }
    next();
}

app.listen(2000, ()=>{
    console.log("server is running")
});